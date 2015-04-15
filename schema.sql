DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS posts;
CREATE TABLE category(
id INTEGER PRIMARY KEY,
title TEXT,
description TEXT,
author TEXT,  
pic TEXT, 
post TEXT 
);
CREATE TABLE posts(
id INTEGER PRIMARY KEY, 
title TEXT, 
author TEXT 
);
