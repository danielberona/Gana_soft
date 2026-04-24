-- Ganasoft MySQL Initialization
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Grant privileges
GRANT ALL PRIVILEGES ON ganasoft.* TO 'ganasoft_user'@'%';
FLUSH PRIVILEGES;
