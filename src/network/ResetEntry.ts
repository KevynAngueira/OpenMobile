import { Alert } from "react-native";
import { LeafAnnotation } from "../types/AnnotationTypes";
import { DevFlags } from "../DevConsole/configs/DevFlagsConfig";
import { DevServerConfig } from "../DevConsole/configs/DevServerConfig";
import { apiFetch } from "./ApiFetch";

export const resetEntry = async (leaf: LeafAnnotation, removeSyncEntry:(id: string)=>void) => {
  // Dev safeguard
  if (!DevFlags.isEnabled("allowResetEntries") || !leaf.video) {
    return;
  }

  const serverURL = DevServerConfig.getBaseURL();
  const filename = leaf.video.split("/").pop();
  const entryId = filename?.replace(/\.[^/.]+$/, "");

  if (!entryId) return;

  Alert.alert(
    "Reset Entry",
    "This will delete cached inference results and require re-uploading inputs.\n\nContinue?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await apiFetch(
              `${serverURL}/reset/${entryId}`,
              {
                method: "POST",
              }
            );

            if (!res.ok) {
              throw new Error(`Reset failed (${res.status})`);
            }

            removeSyncEntry(filename!)

            Alert.alert("Success", "Entry reset successfully.");
          } catch (err) {
            console.error("Reset failed:", err);
            Alert.alert(
              "Reset Failed",
              "The entry could not be reset. Check logs."
            );
          }
        },
      },
    ]
  );
};