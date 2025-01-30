import { defineStorage } from "@aws-amplify/backend"

export const storage = defineStorage({
  name: "amplifyNotesDrive", // s3 bucket name?
  access: (allow) => ({
    "media/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
  }),
})
