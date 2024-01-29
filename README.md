# RailSathi

RailSathi is an API-based web application built with Express.js and Node.js that allows users to check PNR status and find trains between stations. It provides a convenient way for users to access essential railway information quickly and efficiently.

## Features

- Check PNR status: Users can input their PNR (Passenger Name Record) number to check the status of their train ticket.
- Find trains between stations: Users can search for trains between two specified stations, getting information about available trains, their timings, and more.

## Technologies Used

- Express.js: A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- Node.js: A JavaScript runtime built on Chrome's V8 JavaScript engine, used for building scalable network applications.
- Other libraries: This project may also use additional libraries for handling HTTP requests, parsing responses, etc.

## Installation

To run RailSathi locally, follow these steps:

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Install dependencies by running `npm install`.
4. Start the server by running `npm start`.
5. Access the application at `http://localhost:PORT` (where PORT is the port number specified in the configuration or the default port).

## Usage

RailSathi provides a simple API that can be accessed programmatically or through a web interface.

### API Endpoints

- **Check PNR Status**
  - Endpoint: `/pnr-status`
  - Method: POST
  - Parameters:
    - `pnr`: The PNR number to check the status.
  - Response: JSON object containing the status of the PNR.

- **Find Trains Between Stations**
  - Endpoint: `/trains-between-stations`
  - Method: POST
  - Parameters:
    - `source`: The source station code.
    - `destination`: The destination station code.
    - `date`: (Optional) The date of travel.
  - Response: JSON object containing information about trains between the specified stations.

## Contributing

Contributions are welcome! If you'd like to contribute to RailSathi, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/my-feature`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature/my-feature`).
6. Create a new Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
