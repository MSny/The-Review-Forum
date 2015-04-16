DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS posts;
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
vote INT 
);
