import { useDarkMode, useConfig, useSetDebug } from '@eplant/state';
import { ViewProps } from '@eplant/View';
import { FormControlLabel, FormGroup, Switch, Typography } from '@mui/material';
import React from 'react'
import DebugView from '../DebugView';

export default function SettingsView({
  geneticElement,
  activeData,
}: ViewProps<any, any, any>) {
  const [darkMode, setDarkMode] = useDarkMode()
  const [config] = useConfig()
  const setDebug = useSetDebug()
  return (
    <>
    <FormGroup>
      <FormControlLabel
        control={
          <Switch
            onChange={(e) => setDarkMode(e.target.checked)}
            checked={darkMode}
          />
        }
        label="Dark Mode"
      />
    </FormGroup>
    <FormGroup>
      <FormControlLabel
        control={
          <Switch
            onChange={(e) => setDebug(e.target.checked)}
            checked={config.userViews.includes(DebugView)}
          />
        }
        label="Show Debug View"
      />
    </FormGroup>
    </>
  )
}
