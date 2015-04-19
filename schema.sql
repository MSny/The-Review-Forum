DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS subscriptions;
CREATE TABLE category(
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT,
description TEXT,
author TEXT,  
pic TEXT,
vote INT
);
CREATE TABLE posts(
id INTEGER PRIMARY KEY AUTOINCREMENT, 
title TEXT, 
post TEXT,
author TEXT,
category_id INTEGER,
vote INT,
timetolive INT 
);
CREATE TABLE subscriptions(
id INTEGER PRIMARY KEY AUTOINCREMENT, 
email TEXT,
category_id TEXT, 
post TEXT,
name TEXT
);