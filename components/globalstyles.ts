// ./components/globalstyles.ts
import { createGlobalStyle, css } from 'styled-components'

const lightValues = css`
    --text: ${({ theme }) => theme.light.colors.text};
    --background: ${({ theme }) => theme.light.colors.background};
    --highBackground: ${({ theme }) => theme.light.colors.highBackground};
    --myteam-bg: ${({ theme }) => theme.light.colors.myteamBackgound};
    --mention-bg: ${({ theme }) => theme.light.colors.mentionSummaryBackground};
    --mention-high-bg: ${({ theme }) => theme.light.colors.mentionSummaryHighBackground};
    --header-bg: ${({ theme }) => theme.light.colors.headerBackground};
    --header-title-color: ${({ theme }) => theme.light.colors.headerTitleColor};
    --subheader-color: ${({ theme }) => theme.light.colors.subheaderColor};
    --link: ${({ theme }) => theme.light.colors.link};
    --highlight: ${({ theme }) => theme.light.colors.highlight};
    --selected: ${({ theme }) => theme.light.colors.selected};
    --myteam: ${({ theme }) => theme.light.colors.myteam};
    --lowlight: ${({ theme }) => theme.light.colors.lowlight};
    --button: ${({ theme }) => theme.light.colors.button};
    --notificationButton: ${({ theme }) => theme.light.colors.notificationButton};
    --star1:${({ theme }) => theme.light.colors.stars[1]};
    --star2:${({ theme }) => theme.light.colors.stars[2]};
    --star3:${({ theme }) => theme.light.colors.stars[3]};
    --star4:${({ theme }) => theme.light.colors.stars[4]};
    --star5:${({ theme }) => theme.light.colors.stars[5]};
    --qwiket-border-stale:${({ theme }) => theme.light.colors.qwiketBorderStale};
    --qwiket-border-recent:${({ theme }) => theme.light.colors.qwiketBorderRecent};
    --qwiket-border-new:${({ theme }) => theme.light.colors.qwiketBorderNew};
    --mention-border:${({ theme }) => theme.light.colors.mentionBorder};
    --mention-text:${({ theme }) => theme.light.colors.mentionText};
    --secondary-tabs-text:${({ theme }) => theme.light.colors.secondaryTabsText};
    --secondary-tabs-selected:${({ theme }) => theme.light.colors.secondaryTabsSelectedText};
    --secondary-tabs-bg:${({ theme }) => theme.light.colors.secondaryTabsBackground};
    --mobile-header-title-color:${({ theme }) => theme.light.colors.mobileHeaderTitleColor};
    --mobile-header-bg:${({ theme }) => theme.light.colors.mobileHeaderBackground};
    --mobile-subheader-color:${({ theme }) => theme.light.colors.mobileSubheaderColor};
    --leagues-bg:${({ theme }) => theme.light.colors.leaguesBackground};
    --leagues-text:${({ theme }) => theme.light.colors.leaguesText};
    --leagues-selected:${({ theme }) => theme.light.colors.leaguesSelected};
    --leagues-highlight:${({ theme }) => theme.light.colors.leaguesHighlight};
    --mobile-leagues-bg:${({ theme }) => theme.light.colors.mobileLeaguesBackground};
    --mobile-leagues-text:${({ theme }) => theme.light.colors.mobileLeaguesText};
    --mobile-leagues-selected:${({ theme }) => theme.light.colors.mobileLeaguesSelected};
    --mobile-leagues-highlight:${({ theme }) => theme.light.colors.mobileLeaguesHighlight};
    --xColor:${({ theme }) => theme.light.colors.xColor};
`;

const darkValues = css`
    --text: ${({ theme }) => theme.dark.colors.text};
    --background: ${({ theme }) => theme.dark.colors.background};
    --highBackground: ${({ theme }) => theme.dark.colors.highBackground};
    --myteam-bg: ${({ theme }) => theme.dark.colors.myteamBackgound};
    --mention-bg: ${({ theme }) => theme.dark.colors.mentionSummaryBackground};
    --mention-high-bg: ${({ theme }) => theme.dark.colors.mentionSummaryHighBackground};
    --header-bg: ${({ theme }) => theme.dark.colors.headerBackground};
    --header-title-color: ${({ theme }) => theme.dark.colors.headerTitleColor};
    --subheader-color: ${({ theme }) => theme.dark.colors.subheaderColor};
    --link: ${({ theme }) => theme.dark.colors.link};
    --highlight: ${({ theme }) => theme.dark.colors.highlight};
    --selected: ${({ theme }) => theme.dark.colors.selected};
    --myteam: ${({ theme }) => theme.dark.colors.myteam};
    --lowlight: ${({ theme }) => theme.dark.colors.lowlight};
    --button: ${({ theme }) => theme.dark.colors.button};
    --notificationButton: ${({ theme }) => theme.dark.colors.notificationButton};
    
    --star1:${({ theme }) => theme.dark.colors.stars[1]};
    --star2:${({ theme }) => theme.dark.colors.stars[2]};
    --star3:${({ theme }) => theme.dark.colors.stars[3]};
    --star4:${({ theme }) => theme.dark.colors.stars[4]};
    --star5:${({ theme }) => theme.dark.colors.stars[5]};

    --qwiket-border-stale:${({ theme }) => theme.dark.colors.qwiketBorderStale};
    --qwiket-border-recent:${({ theme }) => theme.dark.colors.qwiketBorderRecent};
    --qwiket-border-new:${({ theme }) => theme.dark.colors.qwiketBorderNew};
    --mention-border:${({ theme }) => theme.dark.colors.mentionBorder};
    --mention-text:${({ theme }) => theme.dark.colors.mentionText};
    --secondary-tabs-text:${({ theme }) => theme.dark.colors.secondaryTabsText};
    --secondary-tabs-selected:${({ theme }) => theme.dark.colors.secondaryTabsSelectedText};
    --secondary-tabs-bg:${({ theme }) => theme.dark.colors.secondaryTabsBackground};
    --mobile-header-title-color:${({ theme }) => theme.dark.colors.mobileHeaderTitleColor};
    --mobile-header-bg:${({ theme }) => theme.dark.colors.mobileHeaderBackground};
    --mobile-subheader-color:${({ theme }) => theme.dark.colors.mobileSubheaderColor};
    --leagues-bg:${({ theme }) => theme.dark.colors.leaguesBackground};
    --leagues-text:${({ theme }) => theme.dark.colors.leaguesText};
    --leagues-selected:${({ theme }) => theme.dark.colors.leaguesSelected};
    --leagues-highlight:${({ theme }) => theme.dark.colors.leaguesHighlight};
    --mobile-leagues-bg:${({ theme }) => theme.dark.colors.mobileLeaguesBackground};
    --mobile-leagues-text:${({ theme }) => theme.dark.colors.mobileLeaguesText};
    --mobile-leagues-selected:${({ theme }) => theme.dark.colors.mobileLeaguesSelected};
    --mobile-leagues-highlight:${({ theme }) => theme.dark.colors.mobileLeaguesHighlight};
    --xColor:${({ theme }) => theme.dark.colors.xColor};
`;

const GlobalStyle = createGlobalStyle<{ $light?: boolean; }>`
  html,
  body {
    ${props=>(props.$light?lightValues:darkValues)}
 
    background-color:var(--background) !important;
    color:var(--text);
    padding: 0;
    margin: 0;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  * {
    box-sizing: border-box;
  }
  figure {
    display: block;
    margin-block-start: 0em;
    margin-block-end: 0em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
}
&.cl-formButtonPrimary {
  font-size: 14px;
  height:80px;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
  text-transform: none;
  background-color: #611bbd;
}
 `
export default GlobalStyle
