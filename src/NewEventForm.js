import moment from "moment";
import React, { Component } from "react"
import { RRule } from 'rrule'
import EventManager from "./modules/EventManager"

class NewEventForm extends Component {
    state = {
      title: "",
      start: null,
      end: null,
      recurring: null,
      count: 0,
      end_recurrence: null,
      loadingStatus: true,
    };

    handleFieldChange = evt => {
      const stateToChange = {}
      stateToChange[evt.target.id] = evt.target.value
      this.setState(stateToChange)
    }

    frequency = (eventFrequency) => {
      if(eventFrequency === 'YEARLY'){
        return RRule.YEARLY
      }
      else if(eventFrequency === 'MONTHLY'){
        return RRule.MONTHLY
      }
      else if(eventFrequency === 'WEEKLY'){
        return RRule.WEEKLY
      }
      else if(eventFrequency === 'DAILY'){
        return RRule.DAILY
      }
    }

    createEvent = evt => {
      let rule = null;
      evt.preventDefault()
      this.setState({ loadingStatus: true });

      if(this.state.recurring !== (null || 'DOES-NOT-REPEAT')){

          rule = new RRule({
            freq: this.frequency(this.state.recurring), 
            count: this.state.count,
            dtstart: new Date(this.state.start),
            until: new Date(this.state.end_recurrence)
          }).toString()
          console.log(rule)
      }

      const newEvent = {
        title: this.state.title,
        start: moment(this.state.start),
        end: moment(this.state.end),
        ical_string: rule,
      };
      console.log("newEvent", newEvent)
      EventManager.post(newEvent)
      .then(() => this.props.history.push("/calendar"))
    }

    render() {
      return (
        <>
        <form>
          <fieldset>
            <div>

              <label htmlFor="title">Title: </label>
              <input
                type="text"
                required
                onChange={this.handleFieldChange}
                id="title"
              /><br/>

              <label htmlFor="start">Start: </label>
              <input
                type="datetime-local"
                required
                onChange={this.handleFieldChange}
                id="start"
              /><br/>

              <label htmlFor="end">End: </label>
              <input
                type="datetime-local"
                required
                onChange={this.handleFieldChange}
                min={this.state.start}
                id="end"
              /><br/>

              <label htmlFor="recurring">Recurring: </label>
              <select
                id="recurring"
                onChange={this.handleFieldChange}
                >
                <option></option>
                <option value='DOES-NOT-REPEAT'>Does Not Repeat</option>
                <option value='DAILY'>Daily</option>
                <option value='WEEKLY'>Weekly</option>
                <option value='MONTHLY'>Monthly</option>
                <option value='YEARLY'>Yearly</option>
              </select><br/>

              <label htmlFor="count">Count: </label>
              <input
                type="text"
                onChange={this.handleFieldChange}
                id="count"
              /><br/>

              <label htmlFor="end_recurrence">Until when will this recurring event keep occuring? </label>
              <input
                type="datetime-local"
                onChange={this.handleFieldChange}
                min={this.state.end}
                id="end_recurrence"
              /><br/>

            </div>
            <div className="alignRight">
              <button onClick={this.createEvent}>Create</button>
            </div>
          </fieldset>
        </form>
        </>
      );
    }
}

export default NewEventForm