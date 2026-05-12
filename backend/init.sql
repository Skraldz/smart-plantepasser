CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hubs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hub_id INT NOT NULL,
    FOREIGN KEY (hub_id) REFERENCES hubs(id) ON DELETE CASCADE,
    sensor_module_id INT,
    name VARCHAR(255),
    module_type VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS plants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_module_id INT NOT NULL,
    FOREIGN KEY (sensor_module_id) REFERENCES modules(id) ON DELETE CASCADE,
    plant_idx INT,
    name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS measurements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_module_id INT NOT NULL,
    FOREIGN KEY (sensor_module_id) REFERENCES modules(id) ON DELETE CASCADE,
    timestamp DATETIME DEFAULT NOW(),
    temperature FLOAT,
    humidity FLOAT,
    lux INT,
    lamp_on SMALLINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS soil_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    measurement_id INT NOT NULL,
    FOREIGN KEY (measurement_id) REFERENCES measurements(id) ON DELETE CASCADE,
    plant_id INT NOT NULL,
    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
    soil_moisture INT
);

CREATE TABLE IF NOT EXISTS watering_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plant_id INT NOT NULL,
    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
    timestamp DATETIME DEFAULT NOW(),
    duration_sec INT
);