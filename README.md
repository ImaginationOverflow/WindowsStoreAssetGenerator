# Windows Store Asset Generator
Two simple photoshop scripts to allow you to given a tile generate all the App and Store resources needed. The original tile psd should be at least 1024x1024.

The scripts are configured with the overall image size, the size of the icon, name and background color. 

To set the name, on the psd create a *layer* named **AppTitle** and place it on your desired location (inside the psd). The script automatically will add the name on the configured assets, as an example, it won't add the name on the app tiles.

For the regular backgrounds (one color only) we use the same approach. Create a layer named **Background** and the scripts will handle when it should appear or not.

For more info check the detailed blog post. 

The **WinAppAssets** script generates the following images:

 - Logo
 - SmallLogo
 - SplashScreen
 - Square71x71Logo
 - StoreLogo
 - WideLogo

Each of the items are generated in the 100, 140 and 240 scale.

The **WinStoreAssets** script generates:

 - 414x180
 - 414x468
 - 558x558
 - 558x756
 - 846x468
 - 2400x1200
 - AppTileIcon
 - BgImage
 - SquareIcon
 - WideIcon

Feel free to contribute.
