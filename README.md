[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/TsciYmrA)
# Exam #N2: "Exam Airplane Seats"
## Student: s317264 VITALE LORIS FABRIZIO MARIO 

## React Client Application Routes

- Route `/`: redirects automatically to `/planes`
- Route `/planes`: the home page, it display through the `Planes` component the 3 types of plane, if the user is logged in, it displays the currently booked reservations. 
- Route `/planes/:type`: in this route `Status` component will display using a grid the current status of the the seats for the plane corresponding to the `type`, if the user is logged in it allows to book a reservation trough a form for that plane.
- Route `/login`: allow the user to perform authentication through a login form 
- Route `*`: non matching routes will display a `not found` component


## API Server
  
  __CORE APIs__

  - __GET__ `/api/planes/:type/status` - fetch the seats information of the plane type matching the parameter.
    - Parameter `plane_type`
    - Request Body: __None__
    - Response Status: `200` No Content, `500` Internal server error
    - Response Body: 
  ```
   seats: [
            {
               id: id seat INTEGER
               row: seat INTEGER
               pos: seats position TEXT
               plane_type: text
               status: seat status
      }
      ...
      {

      }
    ]

  ```
  
  - __GET__ `api/user/reservations` - fetch the reservation for user matching the    user who create the request
    - Prerequisite: user is logged in
    - Request Body: authenticated request
    - Response Status: `200`, `500` Internal server error, `404` Not found
    - Response Body: 

   ```
   reservations: [
     {
               id: id reservation INTEGER
               user id: user assocuiated INTEGER
               seats: [array of seats related to the reservation]
               plane_type: text
               
     }
        ...
     {
        ...
     }
               ]
  ```
  - __POST__ `/api/user/reservations` - create a new reservation on db the  user who create the request and update the related seats status
    - Prerequisite: user is logged in
    - Request Body: authenticated request:

    ```
     reservation {
               id: id reservation INTEGER
               seats: [array of seats related to the reservation]
               plane_type: text     
     }

    ```

    - Response Status: `204` no content, `400` bad request (if seats requested are not available taken or if the user has already a reservation for that plane) `500` Internal server error
    - Response Body: NONE or Array of seats unavailable


 - __DELETE__ `/api/user/reservations` - delete reservation on db and update the related seats status
    - Prerequisite: user is logged in
    - Request Body: authenticated request 

    ```
     reservation {
               id: id reservation INTEGER
               seats: [array of seats related to the reservation]
               plane_type: text     
     }

    ```
    - Response Status: `204` no content, `400` bad request (if body is missing, seats requested are taken, or if the user has already a reservation for that plane) `500` Internal server error
    - Response Body: NONE or error

  __SESSION APIs__

- __GET__ `/api/sessions/current` - Get the info about the current user
  - Prerequisite: User is logged in
  - Request Body: __None__
  - Response Status: `200`, `401` Unauthorized
  - Response Body: 
    ```
    {
      id: number - User ID
      username: user Username
    }
  


- __POST__ `/api/sessions` - Create a new session with the logged in user
  - Request Body:
    ```
    {
      username: user username
      password: password
    }
    ```
  - Response Status: `201` OK, `401` Unauthorized
  - Response Body: 
    ```
    {
      id: number - User ID
      username: user username
    }
    ```

 - __DELETE__ `/api/session/current` - Delete the current session and logout the user
    - Prerequisite: User is logged in
   - Request Body: __None__
   - Response Status: `204` No Content, `401` Unauthorized
   - Response Body: __None__


## Database Tables
__
- Table __`users`__ - contains all the users information:  

  *__Columns__:*
  - `id`: integer - Autoincremented (PK)
  - "username"	TEXT NOT NULL UNIQUE,
  - "password"	TEXT NOT NULL,
  - "salt"	TEXT NOT NULL UNIQUE

__
- Table `seats` - contains all the seats information:  

   *__Columns__:*
    - `id`: integer - Autoincremented (PK)
    - `row`	INTEGER NOT NULL,
	 - `position`	TEXT NOT NULL,
  - `status`	TEXT NOT NULL,
   - `plane_type`	TEXT NOT NULL

__
- Table `reservations` - contains all the reservations information:  

   *__Columns__:*

    - `id`: integer - Autoincremented (PK) 
    - `user_id`	INTEGER NOT NULL, FOREIGN KEY("user_id") REFERENCES "users"("id"),
	- `plane_type`	TEXT NOT NULL,
	- `seats`	TEXT NOT NULL 

  

## Main React Components

- `Planes` (in `PlanesComponents.jsx`): the home page of the app , shows 3 planes type to select as image plus text link, if the user is logged in and has some reservations booked, they will be displayed on top of the page, with a button that allow the user to delete the aforementioned reservations.
- `Status` (in `StatusComponents.jsx`): at route `planes/:type`, displays in the right part of the container a grid in which are shown all the seats for the matching plane type, it displays a brief of the status in a card on the left of the container. A non logged user can only visualize the status from this page, a logged user instead, can click on the grid to request seats, the brief form will show the selected seats.
a logged user may also make use of a seats autofinder available in the left side card.
After some seats are selected, a user may choose to reset the requested seats or to book those seats, after being prompt with a pop up confirmation.
At the moment of the confirmation a validatin process is launched, if one or more seats are not available anymore, the seats will blink in the grid for 5 seconds, the functionalitie for this page are limited for this period. After 5 seconds the user can try to book again.
If a user already has a reservation for this plane it will be prompt with a pop up when entering the page, he will not be able to perform action on this page until the related reservation is not deleted. In this case the already booked seats are shown in the left side form.
- `Login` in `AuthComponents.jsx` allows to perform authentication using username and password, redirects to the home page if success or show a message error for wrong credentials 

## Screenshot

![Screenshot](./reservation.png)

## Users Credentials

| username |password |
|---------- |-------------|
| user1 | password1   |
| user2 | password2   |
| user3 | password3   |
| user4 | password4   |
