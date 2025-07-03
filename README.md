Interactive 3D Solar System Explorer
Embark on a virtual journey through our solar system with this fully interactive 3D simulation. Built with vanilla JavaScript and the powerful three.js library, this project offers a visually engaging and educational experience that runs entirely in your browser with zero installation required.
(Note: You can replace this with a screenshot or GIF of your running simulation)
Key Features
Dynamic 3D Environment: Explore a beautifully rendered model of the Sun and all eight planets, each with distinct colors and relative sizes.
Immersive Parallax Starfield: The background is composed of multiple layers of stars that move at different speeds, creating a convincing illusion of depth and a vast, dynamic cosmos.
Data-Rich Exploration: Hover your cursor over any celestial body (including the Sun) to display a tooltip with fascinating facts and real-world data, such as its diameter and actual orbital speed.
Granular Orbit Control: The intuitive side panel allows you to:
View each planet's true orbital speed.
Individually adjust the animation speed of each planet using a multiplier.
Pause, resume, and reset the entire simulation to its natural state.
Intuitive Camera Navigation:
Orbit/Rotate: Click and drag with the left mouse button.
Zoom: Use the mouse scroll wheel for a closer or wider view.
Zero-Setup Required: As a self-contained HTML file using a CDN for three.js, this project requires no build process, package installation, or web server. It just works.
Launching the Simulation
This project is designed for maximum simplicity. It is a single HTML file that runs in any modern web browser like Chrome, Firefox, Safari, or Edge.
Method 1: Direct File Access (Easiest)
Save the complete HTML code into a file named index.html on your computer.
Open your web browser.
Press Ctrl+O (on Windows/Linux) or Cmd+O (on macOS) to open the file browser.
Navigate to and select the index.html file you just saved.
Alternatively, you can simply drag the index.html file icon from your desktop or file manager and drop it into an open browser window.
Method 2: Using a Local Server (For Developers)
If you have a code editor like VS Code with the Live Server extension, you can run it for an experience with automatic browser reloading on code changes.
Place the index.html file in a project folder.
Open the folder in your code editor.
Right-click the index.html file and select "Open with Live Server" (or your editor's equivalent).
How to Interact
Action	Control
Rotate Camera	Click and Drag (Left Mouse Button)
Zoom In / Out	Mouse Scroll Wheel
View Details	Hover over the Sun or a Planet
Adjust Animation Speed	Use the sliders in the left-hand panel
Pause / Resume	Click the Pause/Resume button
Reset Simulation	Click the Reset button
Change Theme	Click the 🌙 / ☀️ icon in the top right
Technologies Powering the Cosmos
HTML5: Provides the structural foundation of the application.
CSS3: Styles the responsive control panel, tooltips, and other UI overlays.
JavaScript (ES6): Drives all the core logic, including the simulation physics, user interaction, and DOM manipulation.
three.js: The powerful 3D graphics library that makes rendering the solar system and its environment possible, loaded directly from a CDN.