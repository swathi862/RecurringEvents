import React, { Component } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { RRule } from 'rrule'
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EventManager from './modules/EventManager'

const localizer = momentLocalizer(moment);

class BasicCalendar extends Component {
  // constructor(){
  //   super()
  //   const now = new Date();
  //   let events = [];
  //   // console.log(rule.all())
  //   console.log(now)
  //   // const rRuleEvents = rule.all()
  //   // for(ruleEvent in rRuleEvents){
  //     events = [
  //       {
  //           id: 0,
  //           title: 'All Day Event very long title',
  //           allDay: true,
  //           start: new Date(2021, 1, 2),
  //           end: new Date(2021, 1, 2),
  //       },
  //       {
  //           id: 1,
  //           title: 'Long Event',
  //           start: new Date(2021, 3, 7),
  //           end: new Date(2021, 3, 10),
  //       },
  //       {
  //           id: 2,
  //           title: 'Right now Time Event',
  //           start: now,
  //           end: now,
  //       },
  //       {
  //         // id: 3,
  //         title: 'Practice Event',
  //         start: new Date().setDate(new Date().getDate() + 2),
  //         end: new Date().setDate(new Date().getDate() + 5),
  //       },
  //     ]
  //     // rRuleEvents.map(ruleDate =>
  //     //   events.push(
  //     //   {
  //     //     title: 'rRule Event',
  //     //     start: ruleDate,
  //     //     // end: new Date().setDate(ruleDate.getDate() + 2),
  //     //     end: ruleDate,
  //     //   },
  //     //   )
  //     // )
  //   this.state = {
  //     events
  //   };
  // }

  state = {
    events: []
  }

  componentWillMount(){

    let calendarEvents = []
    // let rule;

    // function recurringEvents(singleEvent){
    //   if(singleEvent.recurring !== ('DOES-NOT-REPEAT' || null)){
    //       return singleEvent;
    //   }
    //   else{
    //     calendarEvents.push(singleEvent)        
    //   }
    // }

    // function frequency(eventFrequency){
    //   if(eventFrequency === 'YEARLY'){
    //     return RRule.YEARLY
    //   }
    //   else if(eventFrequency === 'MONTHLY'){
    //     return RRule.MONTHLY
    //   }
    //   else if(eventFrequency === 'WEEKLY'){
    //     return RRule.WEEKLY
    //   }
    //   else if(eventFrequency === 'DAILY'){
    //     return RRule.DAILY
    //   }
    // }

      EventManager.getAll()
      .then(apiEvents => {
        console.log('apiEvents', apiEvents)
        // the events I am receiving from the DB already have ical_string populated if they
        // are a recurring event; null ical_string if they are not
        const convertedEvents = apiEvents.map(({ id, title, start, end, ical_string, ...rest }) => {

          const mStart = moment.utc(start);
          const mEnd = moment.utc(end);
          return {
            id: id,
            title: title,
            start: mStart,
            end: mEnd,
            duration: mEnd.diff(mStart),
            rrule: (ical_string !== null ? RRule.fromString(ical_string) : ical_string),

            // Add any additional key/value pairs here. i.e. if you add a new key "foo" to an apiEvent, it will
            // automatically be stuck in here (avoids possibility of forgetting to modify it)
            ...rest
          };
        });

        convertedEvents.forEach(event => {
          // if the the event has a rrule
          if (event.rrule !== null) {
            const occurrences = event.rrule.all();

            //collects recurring events
            occurrences.forEach(calEventDt => {
              const m = moment(calEventDt);

              calendarEvents.push(
                {
                  id: event.id,
                  title: event.title,
                  start: calEventDt,
                  end: m.add(event.duration).toDate()
                },
              )
            })
          } else {

            // const mEStart = moment(event.start)
            // const mEEnd = moment(event.end)

            calendarEvents.push(
              {
                id: event.id,
                title: event.title,
                //makes calendar times same as db times
                // start: moment(event.start),
                // end: moment(event.end),

                //makes week/day views work
                start: event.start.toDate(),
                end: event.end.toDate()
              },
            )
          }
        })



        // const recurringEventsArray = apiEvents.filter(recurringEvents)
        // recurringEventsArray.map(singleEvent => {
        //   rule = new RRule({
        //     freq: frequency(singleEvent.recurring), 
        //     count: singleEvent.count,
        //     // dtstart: new Date(singleEvent.start_duration),
        //     dtstart: new Date(singleEvent.start),
        //     until: new Date(singleEvent.end_recurrence)
        //   })

        //   var ical_rule = rule.toString()

        //   fetch(`http://localhost:8000/calendar/events/${singleEvent.id}/`, {
        //     method: 'PUT',
        //     headers: { "Content-Type": "application/json; charset=UTF-8" },
        //     body: JSON.stringify({ical_string: ical_rule,
        //     title: singleEvent.title})
        //   }).then((response) => {
        //     response.json().then((response) => {
        //     // console.log(response);
        //     })
        //   })

        //   const rRuleEvents = rule.all()

        //   rRuleEvents.map(ruleDate =>
        //     calendarEvents.push(
        //     {
        //       id: singleEvent.id,
        //       title: singleEvent.title,
        //       start: ruleDate,
        //       end: ruleDate,
        //     },
        //     )
        //   )

        // })
        
      })
    console.log('calendarEvents: ', calendarEvents)
    this.setState({
      events: calendarEvents
    })

  }

  // shouldComponentUpdate(nextState){
  //   return this.state.events !== nextState.events
  // }

  render() {
    console.log("this.state.events", this.state.events)
    return (
      <>
        <div style={{ height: '400pt', margin: '2em'}}>
          <Calendar
            events={this.state.events}
            startAccessor="start"
            endAccessor="end"
            defaultDate={moment().toDate()}
            localizer={localizer}
            onSelectEvent={event => {this.props.history.push(`/calendar/${event.id}/edit`)}}
          />
        </div>
        <button onClick={()=>this.props.history.push('/calendar/create')}>Create New Event</button>
      </>
    );
  }
}


export default BasicCalendar
