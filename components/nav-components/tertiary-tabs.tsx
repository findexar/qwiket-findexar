import React from "react";
import { styled } from "styled-components";
import { Tabs, Tab } from '@/components/nav-components/tabs'

const TabsWrap = styled.div`
`;
interface STabsProps {
  selected: boolean;
  isnew: boolean;
}
const STab = styled(Tab) <STabsProps>`
   color:green !important;
   // color:${({ selected, isnew }) => `var(--${isnew ? `qwiket-border-new` : `${selected ? 'selected' : 'text'}`})`} !important;
    background-color: ${({ selected }) => `var(--${selected ? 'background' : 'background'})`} !important;
    font-size: 12px !important;
    width:140px;
    border: 0px solid ${({ selected }) => selected ? `var(--background)` : `var(--background)`}!important;
 `;
interface Option {
  name: string;
  tab: string;
  disabled: boolean;
}
interface Props {
  options: Option[];
  onChange: (option: Option) => void;
  selectedOptionName?: string;
}

const TertiaryTabs: React.FC<Props> = ({ options, onChange, selectedOptionName }: Props) => {
  let selectedValue = 0;

  const tabs = options.map((option: Option, i: number) => {
    let selected = false;
    if (option.tab.toLowerCase() == selectedOptionName?.toLowerCase()) {
      selected = true;
      selectedValue = i;
    }
    // console.log('option.tab:', option.tab, "isnew:", option.tab == 'chat');
    return <STab isnew={option.tab == 'chat'} disabled={option.disabled} selected={selected} key={`t3ab-${option.name}`} label={option.name} />;
  });
  return <TabsWrap>< Tabs id="tabs3" variant="fullWidth" value={selectedValue} onChange={(event, value) => { console.log("onChange", value); onChange(options[value]) }}>{tabs}</Tabs></TabsWrap>;
};

export default TertiaryTabs;