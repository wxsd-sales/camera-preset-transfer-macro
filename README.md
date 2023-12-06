# Camera Presets Backup Restore Macros

These are example macros which let you backup and restore the Camera Presets of your Webex Device.

This is useful in situations where you are factory resetting or replacing device.

## Overview

This solution has two macros, one for backing up your presets and another for restoring them.

### Backup Macro:

The Camera Preset Backup macro exports all the camera presets on your Webex Device and saves them within another macro file for you to download a save. After running the macro will deactivate itself and won't run again until you reactive it.


### Restore Macro:

When the Camera Preset Restore Macro is run, it looks for the backup file created by the Backup Macro. It then save a copy of any existing camera presets in case they are needed in the future. Then the macro begins moving the connected cameras to the positions from the Backup Presets and validates that Pan, Tile, Zoom and Focus are correct before storing the camera position as a new preset. Once all presets are stored, the macro checks and corrects the list order of the presets to match the backup order.

## Setup

### Prerequisites & Dependencies: 

- RoomOS/CE 11.0 or above Webex Board, Desk or Roomkit
- Web admin access to the device to upload the macro.

#### Backup

1. Download the ``camera-preset-backup.js`` file and upload it to your Webex devices Macro editor via the web interface.
2. Enable the backup macro using the toggle in the Macro on the editor.
3. The backup macro will log its progress and when it has saved the camera preset
4. Refresh the macro editor and download the newly generated backup file ``Presets Backup File``

#### Restore

1. Download the ``camera-preset-restore.js`` file and upload it to your Webex devices Macro editor via the web interface.
2. Upload the backup file ``Presets Backup File`` to the Macro Editor also but do not active it.
3. Enable the restore macro ``camera-preset-restore.js`` using the toggle in the Macro on the editor.
4. The macro will log its progress and when it has saved the camera preset
5. Refresh the macro editor and download the newly generated backup file ``Presets Backup File``

## Validation

Validated Hardware:

* Roomkit Pro with Quadcam and PTZ 4K

This macro should work on other Webex Devices devices but has not been validated at this time.

## Demo

*For more demos & PoCs like this, check out our [Webex Labs site](https://collabtoolbox.cisco.com/webex-labs).


## License

All contents are licensed under the MIT license. Please see [license](LICENSE) for details.


## Disclaimer

Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex use cases, but are not Official Cisco Webex Branded demos.

## Questions
Please contact the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=camera-presets-backup-restore-macros) for questions. Or, if you're a Cisco internal employee, reach out to us on the Webex App via our bot (globalexpert@webex.bot). In the "Engagement Type" field, choose the "API/SDK Proof of Concept Integration Development" option to make sure you reach our team.Or, if you're a Cisco internal employee, reach out to us on the Webex App via our bot (globalexpert@webex.bot). In the "Engagement Type" field, choose the "API/SDK Proof of Concept Integration Development" option to make sure you reach our team. 
