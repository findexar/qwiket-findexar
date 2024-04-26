import React from "react";
import { styled } from "styled-components";
import { Tabs, Tab } from '@mui/material'

const TabsWrap = styled.div`
`;
  interface STabsProps {
    selected: boolean;
  }
  const STab = styled(Tab)<STabsProps>`
    color:${({selected})=>`var(--${selected?'selected':'text'})`} !important;
    background-color: ${({selected})=>`var(--${selected?'background':'background'})`} !important;
    font-size: 12px !important;
    width:140px;
    border: 0px solid ${({selected})=>selected?`var(--background)`:`var(--background)` }!important;
 `;
interface Option {
    name: string;
    tab:string;
    disabled:boolean;
}
interface Props {
    options: Option[];
    onChange: (option: Option) => void;
    selectedOptionName?: string;
}

const TertiaryTabs: React.FC<Props> = ({ options, onChange,selectedOptionName }: Props) => {
    let selectedValue=0;
    
    const tabs = options.map((option: Option, i: number) => {
        let selected=false;
        if(option.tab.toLowerCase()==selectedOptionName?.toLowerCase()){
          selected=true;  
          selectedValue=i;
        }
        return <STab disabled={option.disabled}selected={selected} key={`t3ab-${i}`} label={option.name} />;
    });
    return <TabsWrap>< Tabs textColor="primary" variant="fullWidth" value={selectedValue} onChange={(event, value) =>{console.log("onChange",value); onChange(options[value])}}>{tabs}</Tabs></TabsWrap>;
};

export default TertiaryTabs;