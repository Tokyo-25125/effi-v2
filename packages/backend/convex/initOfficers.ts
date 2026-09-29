import { mutation } from "./_generated/server";

export const init = mutation({
  args: {},
  handler: async (ctx) => {
    const users = [
      "user_35geeyng2zO5xhEGoXopM71k4w1",
      "user_35F0LAYg4URnoAJjhkiYLAuOg3H",
    ];
    for (const userId of users) {
      const externalId = `https://enjoyed-cheetah-92.clerk.accounts.dev|${userId}`;
      const existing = await ctx.db
        .query("identities")
        .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, { role: "officer", displayName: "Piyush Pagar" });
      } else {
        await ctx.db.insert("identities", {
          externalId,
          role: "officer",
          displayName: "Piyush Pagar",
        });
      }
    }
    return "Officers provisioned successfully";
  },
});
