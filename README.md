## Travel Route Planner
### Project Overview
  Travel Route Planner is a full-stack web application that helps users plan and visualize travel routes between multiple locations in Odisha, India. The application allows users to select places, calculate the optimal route, and view the route on an interactive map.
  Features

  This repository contains a project with a Django backend and a Next.js frontend. Follow the instructions below to set up and run the project locally.

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm 6+
- MySQL(or any other database you plan to use with Django)

## Setup

### 1. Clone the repository

    git clone https://github.com/Travel-planner
    cd repo_name


### 2. Set up the Django Backend
### 2.1 Create and activate a virtual environment
    sudo apt install python3.10-venv
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`

### 2.2 Setup a database using MySQL
    create database name;
> Update the details of mysql database in the .env file whose example file is added and save it as .env.

### 2.2.1 install the python requirements
    pip install -r requirements.txt

### 2.3 Apply database migrations
    python manage.py makemigrations

### 2.31 Apply database migrations
    python manage.py migrate
    
### 2.4 Create a superuser
    python manage.py createsuperuser
    
### 2.5 Run the Django development server
    python manage.py runserver
    
### 2.6 Login to django administrator using superuser and password
>open backend url and navigate to admin then login.



### 3. Set up the Next.js Frontend
### 3.1 Install the required Node packages
    cd frontend
    npm install
    npm install openrouteservice
    npm install axios
    npm install react leaflet
    npm install leaflet-routing-machine
### 3.2 Run the Next.js development server and go to the login page using the url
    npm run dev
    http://localhost:3000/

## Aditional Information
- Update the settings.py file in django
- Create a account in openrouteservice api.
- Create a .env file using the .envexample file
