CREATE DATABASE IF NOT EXISTS fishing_game;
USE fishing_game;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS fish_species (
  id INT AUTO_INCREMENT PRIMARY KEY, 
  name VARCHAR(100) NOT NULL UNIQUE, 
  location VARCHAR(50) NOT NULL, 
  rarity ENUM('common', 'uncommon', 'rare') NOT NULL 
); 
  
CREATE TABLE IF NOT EXISTS catches ( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  user_id INT NOT NULL, 
  fish_id INT NOT NULL, 
  caught_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, 
  FOREIGN KEY (fish_id) REFERENCES fish_species(id) ON DELETE CASCADE
); 

CREATE TABLE IF NOT EXISTS inventory ( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  user_id INT NOT NULL, 
  fish_id INT NOT NULL, 
  quantity INT NOT NULL DEFAULT 0, 
  UNIQUE KEY unique_user_fish (user_id, fish_id), 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, 
  FOREIGN KEY (fish_id) REFERENCES fish_species(id) ON DELETE CASCADE
); 

INSERT IGNORE INTO fish_species (name, location, rarity) VALUES 
  ('Bluegill', 'Lake', 'common'), 
  ('Bass', 'Lake', 'uncommon'), 
  ('Golden Koi', 'Lake', 'rare'), 
  ('Minnow', 'River', 'common'), 
  ('Salmon', 'River', 'uncommon'), 
  ('Crystal Carp', 'River', 'rare'), 
  ('Sardine', 'Ocean', 'common'), 
  ('Tuna', 'Ocean', 'uncommon'), 
  ('Mythic Marlin', 'Ocean', 'rare')
;
