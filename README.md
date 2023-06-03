This program will scrape the data from the Rai Italian TV channels and save the scraped data in CSV files. Each Channel of the Rai Network will have its own folder, and for each channel folder, there will be the schedule for n days (the number of days, and the number of channels can be chosen in the const file, in the config object).

The scraper has 3 versions: the 1st version handles the concurrency of the promises for each channel (and for each channel the program will scrape a set amount of days);

the second version handles the promises' concurrency for each scraped schedule instead of each channel. 

the third works similarly to the second version, but uses a generator function to handle the concurrency. (V3 is the best version so far)