Build and polish the ClientPulse landing page and make it the homepage route.

Product:
ClientPulse CRM = lightweight CRM for freelancers and small agencies to manage clients, deals, notes, and follow-up tasks.

Goals:
- Premium, startup-quality look
- Strong first impression for judges
- Mobile responsive
- Fast to implement
- Use `shadcn/ui` components where appropriate
- Use Tailwind for layout styling, but keep it componentized
- Keep it elegant, modern, and minimal

Sections to include:
1. Hero section
   - Headline: `Close more clients without the chaos`
   - Subheadline about freelancers/agencies managing clients, deals, and follow-ups in one workspace
   - Primary CTA: `Get Started`
   - Secondary CTA: `View Demo Flow`
   - Right side: product mockup card showing a mini CRM dashboard preview
2. Social proof strip
   - `Built for freelancers, consultants, and boutique agencies`
3. Features section with 3 cards only:
   - Client management
   - Deal pipeline
   - Follow-up tasks
4. How it works:
   - Add clients
   - Move deals in pipeline
   - Track follow-ups
5. MVP demo section with simple workflow cards
6. Final CTA section:
   - `Launch your client ops in minutes`
7. Footer
8. Add a `Why ClientPulse` mini comparison strip:
   - `Scattered spreadsheets` ❌
   - `Missed follow-ups` ❌
   - `One shared CRM workspace` ✅

Requirements:
- Create reusable small sections/components inside `components/shared` if helpful
- Use `lucide-react` icons
- Add subtle gradients and card shadows
- Make CTA buttons route to `/signup` and `/login`
- Add anchor link navigation in the header
- Include a sticky top nav with logo text `ClientPulse`
- Do not add external images
- Use clean placeholder product mock UI built from cards and badges
- Ensure the homepage route is `/` and compiles
- Improve spacing, typography hierarchy, and responsive behavior
- Add subtle hover states on cards and buttons
- Ensure it looks excellent on desktop, tablet, and mobile
- No animation libraries

After changes:
- verify homepage compile/build
- fix any TypeScript/import issues
- summarize files changed
