import React, { Component } from "react"
import { RRule } from 'rrule'
import moment, { now } from 'moment';
import EventManager from "./modules/EventManager"

class EventEditForm extends Component {
    state = {
      title: "",
      start: "",
      end: "",
      recurring: "",
      count: "",
      end_recurrence: "",
      ical_string: "",
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

    updateExistingEvent = evt => {
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
      
      const editedEvent = {
        id: this.props.match.params.eventId,
        title: this.state.title,
        start: moment(this.state.start),
        end: moment(this.state.end),
        ical_string: rule,
      };

      EventManager.update(editedEvent)
      .then(() => this.props.history.push("/calendar"))
    }

    componentDidMount() {
      EventManager.get(this.props.match.params.eventId)

      .then(event => {
        console.log(moment.utc(event.start).local().format('YYYY-MM-DDTHH:mm:ss'))

          this.setState({
            title: event.title,
            start: moment.utc(event.start).local().format('YYYY-MM-DDTHH:mm:ss'),
            end: moment.utc(event.end).local().format('YYYY-MM-DDTHH:mm:ss'),
            ical_string: event.ical_string,
            loadingStatus: false,
          })
            if(this.state.ical_string){
                var ical_array = this.state.ical_string.split(';').map(ical_option => ical_option.split('='))

                this.setState({
                    recurring: ((ical_array[0])[1]),
                    count: (ical_array[1])[1],
                    end_recurrence: moment.utc((ical_array[2])[1]).local().format('YYYY-MM-DDTHH:mm:ss')
                })
            } else{
                this.setState({
                    recurring: 'DOES-NOT-REPEAT'
                })
            }
            
          });
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
                value={this.state.title}
              /><br/>

              <label htmlFor="start">Start: </label>
              <input
                type="datetime-local"
                required
                onChange={this.handleFieldChange}
                id="start"
                value={this.state.start}
              /><br/>

              <label htmlFor="end">End: </label>
              <input
                type="datetime-local"
                required
                onChange={this.handleFieldChange}
                id="end"
                min={this.state.start}
                value={this.state.end}
              /><br/>
            
              <label htmlFor="recurring">Recurring: </label>
              <select
                id="recurring"
                value={this.state.recurring}
                onChange={this.handleFieldChange}
                >
                <option></option>
                <option value='DOES-NOT-REPEAT'>Does Not Repeat</option>
                <option value='DAILY'>Daily</option>
                <option value='WEEKLY'>Weekly</option>
                <option value='MONTHLY'>Monthly</option>
                <option value='YEARLY'>Yearly</option>
              </select><br/>

            {this.state.recurring !== (null || 'DOES-NOT-REPEAT') ?
            <>
              <label htmlFor="count">Count: </label>
              <input
                type="text"
                required
                onChange={this.handleFieldChange}
                id="count"
                value={this.state.count}
              /><br/>

              <label htmlFor="end_recurrence">Until when will this recurring event keep occuring? </label>
              <input
                type="datetime-local"
                required
                onChange={this.handleFieldChange}
                id="end_recurrence"
                min={this.state.end}
                value={this.state.end_recurrence}
              /><br/>
            </>
              :
                null
            }

            </div>
            <div className="alignRight">
              <button disabled={this.state.loadingStatus}
                onClick={this.updateExistingEvent}
              >Submit</button>
            </div>
          </fieldset>
        </form>
        </>
      );
    }
}

export default EventEditForm