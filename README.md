# login_system
Instructions for assignment -

1 ) You have to make A Login System in which there will be 3 pages Sign Up page, Login page and Home Page.
2 ) Home page will be protected you can not access it until you are logged in.
3 ) In Register Page you have to take name, email, phone and password(make Hash of Password then store in database) from user
4 ) After registering stored users details in database(any database) with jwt token and use these details to verify while user try to login
5 ) After successful login user should show users all details with jwt token on home page and
     user can did CRU(Create, Read, Update) operations on details but not on jwt token
6 ) There will be a logout route by which user gets logout.
7) Authentication should be using jwt.
