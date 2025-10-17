chrome.commands.onCommand.addListener((command) => {
    if (command === "open-new-tab-in-active-group") {
      openNewTabInActiveGroup();
    }
  });
  
  async function openNewTabInActiveGroup() {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    if (!activeTab) {
      console.log("No active tab found.");
      return;
    }
  
    let targetGroupId = null;
  

    if (activeTab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
      targetGroupId = activeTab.groupId;
    } else {

      let tabGroups = await chrome.tabGroups.query({ windowId: activeTab.windowId });
  
      for (let i = 0; i < tabGroups.length; i++) {
        const group = tabGroups[i];
        const tabsInGroup = await chrome.tabs.query({ groupId: group.id });
  
        for (let j = 0; j < tabsInGroup.length; j++) {
          if (tabsInGroup[j].active) {
            targetGroupId = group.id;
            break;
          }
        }
        if (targetGroupId != null) {
          break; 
        }
      }
    }
  
    if (targetGroupId) {
      try {
       
        const newTab = await chrome.tabs.create({
          active: true,
          url: "chrome://newtab",
          windowId: activeTab.windowId
        });
  
        await chrome.tabs.group({
          groupId: targetGroupId,
          tabIds: newTab.id
        });
  
        console.log("New tab opened in the current tab group.");
      } catch (error) {
        console.error("Error opening new tab in group:", error);
      }
    } else {
      try {
        await chrome.tabs.create({
          active: true, 
          url: "chrome://newtab", 
          windowId: activeTab.windowId
        });
        console.log("No current group found so the tab was not added into group and just open a new tab");
      } catch (error) {
        console.error("Error opening new tab because no group was found:", error);
      }
      console.log("No current tab group found. You must make or select a tab in a tab group first.");
    }
  }