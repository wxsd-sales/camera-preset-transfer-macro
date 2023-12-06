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
 * The Camera Preset Restore macro retores previously backed up
 * Camera Presets from a backup file by moving the connected camera
 * to the correct position and storing the new position with the same 
 * Preset Name and List Position as definded in the backup.
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

  const backup = await loadBackupFile(config.backupFileName);

  if (!backup) {
    console.log(`No Camera Presets Backup Loaded - Cancelling Restore`);
    deactivateMacro();
    return;
  }

  console.log(`[${backup.length}] Camera Presets Loaded - Beginning Restore`);

  await wakeDevice();
  await clearPresets();
  await restore(backup);
  await validate(backup);

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

async function clearPresets() {
  console.log('Clearing any exiting Camera Presets');
  const presets = await getPresets();
  console.log(`[${presets.length}] Camera Presets found - clearing`);
  for (let i = 0; i < presets.length; i++) {
    const preset = presets[i];
    console.log(`Clearing Preset [${preset.PresetId}]`)
    await xapi.Command.Camera.Preset.Remove({ PresetId: preset.PresetId });
  }
  console.log(`Camera Preset clear completed 👍`);
}


async function restore(presets) {
  console.log(`Restoring [${presets.length}] Camera Presets`)

  await xapi.Command.Cameras.SpeakerTrack.Deactivate();

  for (let i = 0; i < presets.length; i++) {
    const preset = presets[i];
    console.log(`Setting Camera [${preset.CameraId}] Position to Preset:`, preset);

    const foucsMode = await xapi.Config.Cameras.Camera[preset.CameraId].Focus.Mode.get()

    console.log(`Camera [${preset.CameraId}] Focus mode set to:`, foucsMode);

    if (foucsMode == 'Auto') {
      console.log(`Setting Camera [${preset.CameraId}] Focus mode to Manual`)
      await xapi.Config.Cameras.Camera[preset.CameraId].Focus.Mode.set('Manual')
      await sleep(1000)
    }


    if (preset.hasOwnProperty('Lens')) {
      await xapi.Command.Camera.PositionSet(
        { CameraId: preset.CameraId, Lens: preset.Lens, Pan: preset.Pan, Tilt: preset.Tilt, Zoom: preset.Zoom })
    } else {
      await xapi.Command.Camera.PositionSet(
        { CameraId: preset.CameraId, Pan: preset.Pan, Tilt: preset.Tilt, Zoom: preset.Zoom })

    }

    let stored = false;
    let attempt = 0;
    const maxAttempts = 3;


    while (!stored) {
      console.log('Waiting 4 seconds');
      await sleep(4000)
      const cameraStatus = await xapi.Status.Cameras.Camera[preset.CameraId].Position.get();

      const presetZoom = parseInt(preset.Zoom);
      const cameraZoom = parseInt(cameraStatus.Zoom);

      const zoomDiff = Math.abs(presetZoom - cameraZoom)



      if (preset.Pan == cameraStatus.Pan && preset.Tilt == cameraStatus.Tilt && zoomDiff < (presetZoom * 0.1)) {
        console.log(`Camera [${preset.CameraId}] is in position 🎉 - storing preset`);
        await xapi.Command.Camera.Preset.Store({ CameraId: preset.CameraId, DefaultPosition: preset.DefaultPosition, ListPosition: preset.ListPosition, Name: preset.Name, PresetId: preset.PresetId });
        stored = true;
      } else {
        attempt = attempt + 1;
        console.log(`Checking camera [${preset.CameraId}] not in position 😥 - attempt [${attempt}]`)
        if (preset.Pan != cameraStatus.Pan) {
          console.log(`Camera [${preset.CameraId}] Pan does not match preset - Preset Pan: ${preset.Pan} | Camera [${preset.CameraId}] Pan: ${cameraStatus.Pan}`)
        }
        if (preset.Tilt != cameraStatus.Tilt) {
          console.log(`Camera [${preset.CameraId}] Tilt does not match preset - Preset Tilt: ${preset.Tilt} | Camera [${preset.CameraId}] Tilt: ${cameraStatus.Tilt}`)
        }
        if (zoomDiff < (presetZoom * 0.1)) {
          console.log(`Camera [${preset.Zoom}] Zoom does not match preset  - Preset Zoom: ${preset.Zoom} | Camera [${preset.CameraId}] Zoom: ${cameraStatus.Zoom} | Zoom Diff: ${zoomDiff}`)
        }
      }

      if (attempt == maxAttempts) {
        console.log('Max attempts reached ❌');
        console.log('Preset:', preset, 'Camera Status:', cameraStatus);
        stored = true;
      }
    }

    await xapi.Config.Cameras.Camera[preset.CameraId].Focus.Mode.set(foucsMode);
    sleep(1000)
  }

  console.log('Camera Preset Restore Completed 👍')

}

async function validate(presetBackup) {
  console.log('Validating Camera Presets');

  const currentPresets = await getPresets();

  if (currentPresets.length == 0) {
    console.log('No Current Camera Presets found');
    deactivateMacro();
    return
  }

  if (currentPresets.length < presetBackup.length) {
    console.warn(`Missing [${presetBackup.length - currentPresets.length}] Camera Presets`);
    deactivateMacro();
    return
  }

  console.log(`[${currentPresets.length}] Camera Presets found - Validating`);

  for (let i = 0; i < currentPresets.length; i++) {
    const preset = currentPresets[i];
    for (let j = 0; j < presetBackup.length; j++) {
      const backupPreset = presetBackup[j];
      if (preset.PresetId == backupPreset.PresetId && preset.ListPosition != backupPreset.ListPosition) {
        console.log(`Preset id [${preset.PresetId}] is in ListPosition [${preset.ListPosition}] but should be [${backupPreset.ListPosition}] - Changing List Position`)
        await xapi.Command.Camera.Preset.Edit({ ListPosition: backupPreset.ListPosition, PresetId: preset.PresetId });
      }
    }
  }
  console.log(`Camera Validation Completed 👍`);
}


function deactivateMacro() {
  const macroName = _main_macro_name();
  console.log(`Deactivating Macro [${macroName}] - It has been a pleasure 🫡`)
  xapi.Command.Macros.Macro.Deactivate({ Name: macroName });
}


function savePresetBackup(presets) {
  console.log('Saving Cameras Presets to backup file - please refresh your macro editor')
  xapi.Command.Macros.Macro.Save(
    { Name: 'Presets Backup File', Overwrite: 'True', Transpile: value }, JSON.stringify);
}

async function wakeDevice() {
  const state = await xapi.Status.Standby.State.get()
  if (state == 'Off') {
    console.log('Device is already awake, resetting Halfwake and Standby Timers')
    await xapi.Command.Standby.ResetTimer();
    await xapi.Command.Standby.ResetHalfwakeTimer();
    return
  }
  console.log('Waking Device out of standby and waiting 3 seconds')
  await xapi.Command.Standby.Deactivate();
  await sleep(3000);
}

async function loadBackupFile(filename) {
  console.log(`Loading Backup File [${filename}]`)
  const file = await xapi.Command.Macros.Macro.Get({ Content: 'True', Name: filename })
    .catch(error => {
      if (error.message == 'No such macro') {
        console.log(`File [${filename}] does not exist`)
      } else {
        console.warn('Error Loading File - ', error.message)
      }
    })
  if (!file) {
    console.log(`Please ensure the backup file [${filename}] has been uploaded to this device before running this macro`)
    return
  }
  const presets = JSON.parse(file.Macro[0].Content);
  return presets
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
