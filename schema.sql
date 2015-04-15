DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS posts;
CREATE TABLE category(
id INTEGER PRIMARY KEY,
title TEXT,
description TEXT,
author TEXT,  
pic TEXT
);
CREATE TABLE posts(
id INTEGER PRIMARY KEY, 
title TEXT, 
post TEXT,
author TEXT,
category_id INTEGER 
);
