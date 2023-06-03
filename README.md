This program will scrape the data from the Rai italian TV channels and save the scraped data in csv files. Each Channel of the Rai Network will have it's own folder, and for each channel folder there will be the schedule for n days (the amount of days, and the amount of channels can be choosen in the const file, in the config object).

The scraper has 3 versions: the 1st version handle the concurrency of the promises for each channel (and for each channel the program will scrape a set amount of days);

the second version handle the concurrency of the promises for each scraped schedule instead of each channel. 

the third works similarly as the second version, but uses a generator function to handle the concurrency.