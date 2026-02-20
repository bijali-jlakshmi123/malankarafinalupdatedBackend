// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    console.error(
      "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
    );
    console.error("[Bootstrap] PERMISSION SYNC STARTING...");
    console.error(
      "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
    );

    try {
      const publicRoleID = 2; // Verified manually in DB

      const permissionsToEnable: Record<string, string[]> = {
        "api::rooms-suite.rooms-suite": ["find", "findOne"],
        "api::dining.dining": ["find", "findOne"],
        "api::experience.experience": ["find", "findOne"],
        "api::wellness.wellness": ["find", "findOne"],
        "api::facility.facility": ["find", "findOne"],
        "api::site-setting.site-setting": ["find"],
        "api::navigation-item.navigation-item": ["find", "findOne"],
        "api::facilities-page.facilities-page": ["find"],
        "api::amenity-icon.amenity-icon": ["find", "findOne"],
        "api::facility-section.facility-section": ["find", "findOne"],
        "api::dining-page.dining-page": ["find"],
        "api::dining-section.dining-section": ["find", "findOne"],
        "api::experiences-page.experiences-page": ["find"],
        "api::wedding-event.wedding-event": ["find", "findOne"],
        "api::wedding-events-page.wedding-events-page": ["find"],
        "api::gallery.gallery": ["find", "findOne"],
        "api::gallery-page.gallery-page": ["find"],
        "api::our-story.our-story": ["find"],
      };

      for (const [uid, actions] of Object.entries(permissionsToEnable)) {
        for (const action of actions) {
          const actionString = `${uid}.${action}`;
          try {
            // Check if permission already exists for this role
            const results = await strapi.db.connection.raw(
              `SELECT p.id FROM up_permissions p 
               JOIN up_permissions_role_lnk l ON p.id = l.permission_id 
               WHERE l.role_id = ? AND p.action = ?`,
              [publicRoleID, actionString],
            );

            if (results.rowCount === 0) {
              // Create permission record
              const permission = await strapi.db
                .query("plugin::users-permissions.permission")
                .create({
                  data: {
                    action: actionString,
                    role: publicRoleID,
                  },
                });
              console.error(`[Bootstrap] SUCCESS: ${actionString}`);
            } else {
              console.error(
                `[Bootstrap] SKIP (Already exists): ${actionString}`,
              );
            }
          } catch (itemError) {
            console.error(
              `[Bootstrap] ERROR for ${actionString}: ${itemError.message}`,
            );
          }
        }
      }
      console.error("[Bootstrap] PERMISSION SYNC FINISHED.");
    } catch (error) {
      console.error("[Bootstrap] CRITICAL ERROR:", error.message);
    }
  },
};
