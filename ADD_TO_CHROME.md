# 🚀 How to Add Visual Click Prompt (VCP) to Google Chrome

Adding VCP to Google Chrome takes less than **10 seconds** and requires **zero developer fee** ($0).

---

## ⚡ Method 1: The 1-Click Installer (Recommended & Fastest)

If you are on Windows, simply run the automated script included in this repository:

1. Double-click **`add-to-chrome.bat`** (or run `.\add-to-chrome.bat` from terminal).
2. The script will:
   - ✅ Automatically **copy the extension path** directly to your Windows clipboard.
   - ✅ Automatically **open Google Chrome** to `chrome://extensions`.
   - ✅ Automatically open Windows Explorer highlighting the folder.
3. In the Chrome tab that opens:
   - Toggle **"Developer mode"** `ON` (switch in the top-right corner).
   - Click **"Load unpacked"** (button in top-left corner).
   - Press <kbd>Ctrl</kbd> + <kbd>V</kbd> to paste the path, then press <kbd>Enter</kbd> (or click *Select Folder*).
4. **Done!** VCP is installed and active.

---

## 🛠️ Method 2: Manual 3-Step Setup

If you prefer installing manually or are on Mac / Linux:

### Step 1: Open Chrome Extensions
- Open Google Chrome.
- In the address bar, type `chrome://extensions` and press <kbd>Enter</kbd>.
- *(Alternatively: Click the 3 dots menu (⋮) → **Extensions** → **Manage Extensions**)*.

```
+---------------------------------------------------------------------------------+
| chrome://extensions                                                             |
+---------------------------------------------------------------------------------+
| Extensions                             [ Search extensions ]   [Developer mode: ON]
|                                                                                    |
| [Load unpacked]  [Pack extension]  [Update]                                       |
+---------------------------------------------------------------------------------+
```

### Step 2: Enable Developer Mode
- In the **top-right corner**, toggle the switch labeled **"Developer mode"** to **ON**.
- You will see three new buttons appear in the top-left toolbar: `Load unpacked`, `Pack extension`, and `Update`.

### Step 3: Load Unpacked Folder
- Click the **"Load unpacked"** button.
- Navigate to the `extension` folder inside this repository:
  - On Windows: `C:\prj\vcp\extension`
  - On Mac/Linux: `/path/to/vcp/extension`
- Click **"Select Folder"** (or **"Open"**).

---

## 📌 Pinning VCP for Quick Access

To access the VCP dashboard anytime:
1. Click the **Puzzle Piece icon** (🧩) in the top-right toolbar of Chrome.
2. Find **Visual Click Prompt (VCP)** in the list.
3. Click the **Pin icon** (📌) next to it so it stays visible in your browser toolbar.

---

## ⚡ Master ON / OFF Control

VCP includes full non-intrusive power controls:
- **Master Power Switch:** Open the popup by clicking the toolbar icon, and flip the **Master ON/OFF Switch**. When OFF, VCP goes 100% dormant with zero DOM changes and zero performance impact on pages.
- **In-Page Power Button (`⏻`):** Click the red power button on the floating HUD dock on any webpage to immediately turn VCP OFF.
- **Minimize Orb (`—`):** Click the minimize button on the HUD to collapse it into a discreet, glowing circular icon in the corner. Click the orb anytime to expand.
- **Pin Mode Toggle:** Press <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> to toggle Pin Mode without opening the extension menu.

---

## 🔄 Updating VCP After Code Changes

When you update or pull new code from GitHub:
1. Go back to `chrome://extensions`.
2. Locate the **Visual Click Prompt (VCP)** card.
3. Click the circular **Reload icon** (🔄) on the card.
4. The extension instantly refreshes with your latest changes!

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> | **Toggle Pin Mode / Activate** | Turns Pin Mode ON/OFF or awakens VCP if dormant. |
| <kbd>Esc</kbd> | **Cancel / Close** | Closes active popover or inspect mode. |
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> | **Save Pin Card** | Quickly saves current prompt inside the popover. |

---

## 🩺 Troubleshooting

- **"Manifest file is missing or unreadable"**:
  Make sure you selected the `extension` subfolder (`C:\prj\vcp\extension`), not the parent `C:\prj\vcp` root folder.
- **Bridge shows "Offline" in popup**:
  Ensure the local bridge daemon is running (`start-bridge.bat` or `node bridge/server.js`). If offline, clicking "Send" automatically copies the formatted task prompt to your clipboard as a fallback!
