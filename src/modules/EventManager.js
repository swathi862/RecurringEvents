const remoteURL = "http://localhost:8000/calendar"

const EventManager = {
  get(id) {
    return fetch(`${remoteURL}/events/${id}/`).then(result => result.json())
  },
  getAll() {
    return fetch(`${remoteURL}/events/`).then(result => result.json())
  },
  delete(id) {
    return fetch(`${remoteURL}/events/${id}/`, {
        method: "DELETE"
    })
    .then(result => result.json())
  },
  post(newEvent) {
    return fetch(`${remoteURL}/events/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(newEvent)
    }).then(data => data.json()).then((response)=>console.log(response))
  },
  update(editedEvent){
    return fetch(`${remoteURL}/events/${editedEvent.id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(editedEvent)
    }).then(data => data.json()).then((response)=>console.log(response));
  }
}

export default EventManager