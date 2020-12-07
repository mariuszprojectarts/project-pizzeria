import { templates, select, settings, classNames } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import { utils } from '../utils.js';

class Booking {
    constructor(element) {
        const thisBooking = this;

        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
        thisBooking.bookingTable();
        thisBooking.iniAction();
    }


    getData() {
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            booking: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        };

        //console.log('getData params', params);

        const urls = {
            booking: settings.db.url + '/' + settings.db.booking
                + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.event
                + '?' + params.eventsCurrent.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.event
                + '?' + params.eventsRepeat.join('&'),
        };

        // console.log('getData urls', urls);

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
            .then(function (allResponses) {
                const bookingsResponse = allResponses[0];
                const eventsCurrentResponse = allResponses[1];
                const eventsRepeatResponse = allResponses[2];
                return Promise.all([
                    bookingsResponse.json(),
                    eventsCurrentResponse.json(),
                    eventsRepeatResponse.json(),
                ]);
            })
            .then(function ([bookings, eventsCurrent, eventsRepeat]) {
                // console.log(bookings);
                // console.log(eventsCurrent);
                // console.log(eventsRepeat);

                thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
            });
    }

    parseData(bookings, eventsCurrent, eventsRepeat) {

        const thisBooking = this;

        thisBooking.booked = {};

        for (let item of bookings) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for (let item of eventsCurrent) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for (let item of eventsRepeat) {
            if (item.repeat == 'daily') {
                for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }

        //console.log('thisBooking.booked:', thisBooking.booked);

        thisBooking.updateDom();
    }

    makeBooked(date, hour, duration, table) {

        const thisBooking = this;

        if (typeof thisBooking.booked[date] == 'undefined') {
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
            //console.log('loop', hourBlock);

            if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
                thisBooking.booked[date][hourBlock] = [];
            }

            thisBooking.booked[date][hourBlock].push(table);
        }
    }

    updateDom() {

        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        thisBooking.selectedTables = [];

        if (
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ) {
            allAvailable = true;
        }

        for (let table of thisBooking.dom.tables) {
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            table.classList.remove(classNames.booking.tableChosed);
            if (!isNaN(tableId)) {
                tableId = parseInt(tableId);
            }

            if (
                !allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ) {
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
    }

    render(element) {

        const thisBooking = this;
        const generatedHTML = templates.bookingWidget();

        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.innerHTML = generatedHTML;



        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        console.log('thisBooking.dom.peopleAmount', thisBooking.dom.peopleAmount);

        thisBooking.dom.peopleAmount.input = thisBooking.dom.peopleAmount.querySelector('.amount');
        console.log('thisBooking.dom.peopleAmount.input ', thisBooking.dom.peopleAmount.input.value);

        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);

        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
        thisBooking.dom.hourPicker.output = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.output);
        thisBooking.dom.hourPicker.input = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.input);

        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

        thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
        //console.log('thisBooking.dom.starters', thisBooking.dom.starters);

        thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
        thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);

        thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
        //console.log('thisBooking.dom.form ', thisBooking.dom.form);


    }

    initWidgets() {

        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.wrapper.addEventListener('updated', function () {
            thisBooking.updateDom();
        });
    }

    bookingTable() {
        const thisBooking = this;
    
        thisBooking.selectedTables = [];
    
        for (let clickableTable of thisBooking.dom.tables) {
    
          clickableTable.addEventListener('click', (e) => {
    
            e.preventDefault();
    
            if (clickableTable.classList.contains(classNames.booking.tableBooked)) {
    
              alert('zajęty');
    
            } else {
    
              let clickedTableId = parseInt(clickableTable.getAttribute(settings.booking.tableIdAttribute));
    
              if (thisBooking.selectedTables.includes(clickedTableId)) {
    
                const index = thisBooking.selectedTables.indexOf(clickedTableId);
                thisBooking.selectedTables.splice(index, 1);
    
              } else {
    
                thisBooking.selectedTables.push(clickedTableId);

                thisBooking.makeBooked(thisBooking.datePicker.value, thisBooking.dom.hourPicker.output.innerHTML, parseInt(thisBooking.dom.hoursAmount.input.value), parseInt(clickedTableId));
              }
    
              console.log('selectedTables', thisBooking.selectedTables);
    
    
              clickableTable.classList.toggle(classNames.booking.tableChosed);
            }
    
          });
    
    
    
        }
      }

    iniAction() {
        const thisBooking = this;

        thisBooking.dom.form.addEventListener('submit', function (event) {
            event.preventDefault();

            console.log('click book Table');

            thisBooking.sendBooking();
        });

    }


    sendBooking() {
        const thisBooking = this;

        const url = settings.db.url + '/' + settings.db.booking;

        const payload = {
            date: thisBooking.datePicker.value,
            hour: thisBooking.hourPicker.value,
            table: thisBooking.selectedTables,
            duration: thisBooking.hoursAmount.value,
            ppl: thisBooking.peopleAmount.value,
            starters: [],
            phone: thisBooking.dom.phone.value,
            adress: thisBooking.dom.address.value,
        };

        for (let chosedStarter of thisBooking.dom.starters) {

            if (chosedStarter.checked) {
                payload.starters.push(chosedStarter.getAttribute('value'));
            }
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };

        fetch(url, options)
            .then(function (responce) {
                return responce.json();
            }).then(function (parsedResponse) {
                console.log('parsedResponse', parsedResponse);
            });
    }
}

export default Booking;