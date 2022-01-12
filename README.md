# Spotishare

Project deployed at: https://spotishare-test.herokuapp.com/

***

An online real-time listening party! Using Spotify's API and Spotify's Web Player SDK this web app acts as a Spotify app instance and music is played straight from the tab on your browser.

To use the app, a user must have Spotify Premium, as it is a requirement to use the web player SDK.

### Screenshots
On the home page, the notice for requiring premium is displayed to the user. When the create lobby button or sign in button is clicked, they are redirected to Spotify's sign in page.

![image](https://user-images.githubusercontent.com/41880283/149177085-58770142-3f96-42d6-b985-f5eaa7cf9cd3.png)

Screen once user is signed in.

![image](https://user-images.githubusercontent.com/41880283/149177289-cb90c633-ae81-44d6-89cf-5e79c8236ea1.png)

This is the pre-lobby screen. This is displayed when a user clicks on an invite link from a friend, or when they initially create the lobby. A confirmation button and room code are both displayed to make sure they are in the right place.

![image](https://user-images.githubusercontent.com/41880283/149177356-412d3bb2-2811-47aa-af89-fd67bf62b842.png)

This is the actual listening party! This is the initial state when a user joins, letting the user know nothing is playing, yet. A dropdown in the chat section on the right side lets them know how many people are currently in the party. 

![chrome_aAIfFoE8fi](https://user-images.githubusercontent.com/41880283/149182135-7f575e4d-9457-41ac-8846-96201562e258.gif)

This is the search bar where you can look for songs! Songs are retrieved from a Spotify API request, and displayed in a list for a user to browse and choose which song they want to add to the queue.

![chrome_svOtrDID3J](https://user-images.githubusercontent.com/41880283/149195183-67c436e8-b2e7-49db-86f1-a42f3567821e.gif)

Once a song is added into the queue, it automatically begins. The queue shows details about the song, as well as who added it into the queue.
In the web player, the album cover, song name, artist and volume control are displayed to all users, while the play/pause, rewind, and seek forward controls are only visible to the host. 
