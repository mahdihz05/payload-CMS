import type { MetadataRoute } from "next";
import { robotsPolicy } from "@/lib/robots-policy";
import { siteURL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const site = siteURL();
  const production = process.env.NODE_ENV === "production" && process.env.DEPLOYMENT_ENV !== "staging";
  return robotsPolicy(site, production);
}
