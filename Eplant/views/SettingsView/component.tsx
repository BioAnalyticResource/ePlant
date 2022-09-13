import { useConfig } from '@eplant/config'
import { useSettings } from '@eplant/state'
import { ViewProps } from '@eplant/View'
import { FormControlLabel, FormGroup, Switch, Typography } from '@mui/material'
import React from 'react'
import DebugView from '../DebugView'

export default function SettingsView({
  geneticElement,
  activeData,
}: ViewProps<any, any, any>) {
  const [settings, setSettings] = useSettings()
  return (
    <>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked})}
              checked={settings.darkMode}
            />
          }
          label="Dark Mode"
        />
      </FormGroup>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              onChange={(e) => setSettings({...settings, debugMode: e.target.checked})}
              checked={settings.debugMode}
            />
          }
          label="Show Debug View"
        />
      </FormGroup>
    </>
  )
}
