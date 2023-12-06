/********************************************************
 * 
 * Macro Author:      	William Mills
 *                    	Technical Solutions Specialist 
 *                    	wimills@cisco.com
 *                    	Cisco Systems
 * 
 * Version: 1-0-0
 * Released: 06/12/23
 * 
 * The Camera Preset Backup macro exports all the camera
 * presets on your Webex Device and saves them within another
 * macro file for you to download a save.
 * 
 * After running the macro will deactivate itself and won't
 * run again until you reactive it.
 * 
 * 
 * Full Readme, source code and license agreement available on Github:
 * https://github.com/wxsd-sales/camera-presets-backup-restore-macros
 * 
 ********************************************************/

import xapi from 'xapi';

/*********************************************************
 * Configure the settings below
**********************************************************/

const config = {
  backupFileName: 'Presets Backup File'
}

/*********************************************************
 * Main functions and event subscriptions
**********************************************************/

main();

async function main() {
  const presets = await getPresets();
  if (presets.length == 0) {
    console.log(`No Camera Presets Found - Cancelling Backup`);
    deactivateMacro();
    return;
  }

  console.log(`[${presets.length}] Camera Presets Found - Backing Up`);
  await savePresetBackup(config.backupFilename, presets);
  deactivateMacro();
}


async function getPresets() {
  const presets = await xapi.Command.Camera.Preset.List()
  if (!presets.hasOwnProperty('Preset')) return []
  const output = [];
  for (let i = 0; i < presets.Preset.length; i++) {
    const preset = presets.Preset[i];
    const presetDetails = await xapi.Command.Camera.Preset.Show({ PresetId: preset.PresetId })
    output.push(presetDetails);
  }
  return output
}

function deactivateMacro() {
  const macroName = _main_macro_name();
  console.log(`Deactivating Macro [${macroName}] - It has been a pleasure 🫡`)
  xapi.Command.Macros.Macro.Deactivate({ Name: macroName });
}

async function savePresetBackup(filename='Presets Backup File', presets) {
  console.log(`Saving [${presets.length}] Camera Presets to backup file [${filename}] - Please refresh your macro editor to download the backup file`)
  await xapi.Command.Macros.Macro.Save({ Name: filename, Overwrite: 'True'  }, JSON.stringify(presets));
}
