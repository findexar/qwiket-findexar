//./lib/palette.ts
import { blueGrey, cyan, teal,amber,yellow,red,green ,indigo,grey,brown,deepOrange,deepPurple,pink} from '@mui/material/colors'
export const palette = {  
    light: { 
        colors: {
            text: "#222222",//color:"#607D8B",
            link: blueGrey[600],//"#607D8B",
            highlight: red[900],// "#388e3c",
            selected:amber[900],
            myteam:indigo[600],
            lowlight: "#f8f8f8",     
           // background: "#F5F5F5",
            background:"#fff",  
            highBackground: "#f0f0f0",// g[100]
            myteamBackgound:green[50],
            mentionSummaryBackground:grey[100],
            mentionSummaryHighBackground:blueGrey[50],
            mentionBorder:"#fff",
            mentionText:blueGrey[900],
            headerBackground:grey[50],
            headerTitleColor:blueGrey[900],
            subheaderColor:blueGrey[700],
            mobileHeaderTitleColor:blueGrey[50],
            mobileHeaderBackground:blueGrey[900],
            mobileSubheaderColor:blueGrey[50],
            button: "#F5F5F5",
            notificationButton:"#01579B",
            qwiketBorderStale:"rgb(168, 168, 168)",
            qwiketBorderRecent:"rgb(255, 193, 7)",
            qwiketBorderNew:"rgb(76, 175, 80)",
            stars: [
                "#000000",
                "#388E3C", //green[700]
                "#1A237E", //indigo[900]
                "#B0BEC5", //bluegrey[200]
                "#FF6F00", //amber[900]
                "#B71C1C"  //red[900]
            ],
            secondaryTabsText:blueGrey[100],
            secondaryTabsSelectedText:amber[100],
            secondaryTabsBackground:grey[700],   
            leaguesBackground:grey[800],
            leaguesText:blueGrey[50],
            leaguesSelected:yellow[200],
            leaguesHighlight:amber[200], 
            mobileLeaguesBackground:grey[50],
            mobileLeaguesText:blueGrey[900],
            mobileLeaguesSelected:yellow[900],
            mobileLeaguesHighlight:amber[900], 
            xColor:yellow[200],
        }

    },
    dark: {
        colors: {
            text:grey[400],//"#F5F5F5",
            link: "#F5F5F5",
            highlight:amber[50],
            selected:amber[300],
            myteam:grey[400],
            lowlight:"#444",
            background: brown[900],//"#607D8B", //bg[500]
            highBackground: "#383838",
            myteamBackgound:green[900],
            mentionSummaryBackground:brown[800],
            mentionSummaryHighBackground:brown[700],
            mentionBorder:brown[300],
            mentionText:grey[200],
            headerBackground:blueGrey[900],
            headerTitleColor:blueGrey[50],
            subheaderColor:blueGrey[200],
            mobileHeaderTitleColor:blueGrey[50],
            mobileHeaderBackground:blueGrey[900],
            mobileSubheaderColor:blueGrey[50],
            button:"#607D8B",
            notificationButton:"#0277BD",
            qwiketBorderStale:"rgb(168, 168, 168)",
            qwiketBorderRecent:"rgb(255, 193, 7)",
            qwiketBorderNew:"rgb(76, 175, 80)",
            stars: [
                "#000000",
                "#388E3C", //green[700]
                "#1A237E", //indigo[900]
                "#B0BEC5", //bluegrey[200]
                "#FF6F00", //amber[900]
                "#B71C1C"  //red[900]
            ],
            secondaryTabsText:blueGrey[100],
            secondaryTabsSelectedText:amber[200],
            secondaryTabsBackground:pink[900],  
            leaguesBackground:teal[800],
            leaguesText:blueGrey[50],
            leaguesSelected:yellow[300],
            leaguesHighlight:amber[600], 
            mobileLeaguesBackground:teal[800],
            mobileLeaguesText:blueGrey[50],
            mobileLeaguesSelected:yellow[300],
            mobileLeaguesHighlight:amber[600], 
            xColor:yellow[200],
        }
    },
}