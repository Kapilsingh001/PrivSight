# PrivSight

Privacy-preserving browser agent. Smart India Hackathon 2026, problem statement SIH26171.

## Phase 1 scope

Proves the plumbing only:

```
Chrome page -> extension (DOM extraction) -> POST /reason -> hardcoded action -> extension -> click
```

No PII detection, redaction, OCR, local models, cloud reasoning or validation yet.

## Layout

```
backend/     FastAPI app. POST /reason returns a fixed click action.
extension/   Chrome Manifest V3 extension (TypeScript, Vite).
demo-site/   Local shopping page used as the controlled test target.
```

The wire contract lives in two files that must stay identical:

- `extension/src/shared/contract.ts`
- `backend/app/schemas.py`

## Run

Three terminals.

**1. Backend** (port 8000)

```
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```

Check: `curl http://localhost:8000/health` returns `{"status":"ok"}`.

**2. Demo site** (port 8080)

```
cd demo-site
python -m http.server 8080
```

Open http://localhost:8080/index.html in Chrome.

Opening `index.html` directly as a `file://` URL also works, but then you must
tick "Allow access to file URLs" on the extension card in `chrome://extensions`.

**3. Extension**

```
cd extension
npm install
npm run build
```

Then in Chrome: `chrome://extensions`, enable Developer mode, Load unpacked,
select `extension/dist`. After every `npm run build`, click the reload icon on
the extension card.

## Demo

1. Open the demo site tab.
2. Click the PrivSight toolbar icon.
3. The task box is prefilled with "Find the cheapest black shirt and click Buy Now". Click Run.
4. Status panel shows extraction, backend call, action received, action executed.
5. The Buy Now button turns green and reads "Purchased", with a timestamp line under it.

Keep the popup open during the run. Status lines are sent to the popup live and
are not stored, so closing it mid-run loses the log (the action still executes).

## Verify each step

- Backend receives the request: the uvicorn terminal prints a `[reason]` line with the task, URL and element count.
- Elements got identifiers: on the demo page open DevTools and run `document.querySelectorAll('[data-ps-id]')`. Expect `el_products`, `el_about`, `el_buy_now`.
- Request shape: DevTools on the service worker (`chrome://extensions`, "Inspect views: service worker"), Network tab, the `/reason` request body.

## How IDs are assigned

`extension/src/content/element-ids.ts` gives every visible button, link, input,
select and textarea a `data-ps-id`. The ID comes from the element's own `id`
attribute when it has one, otherwise from its visible text, otherwise from a
counter. Elements that already carry an ID are left alone, so the assignment is
stable across repeated runs on the same page state. The demo page's button has
`id="buy_now"`, which is why it receives `el_buy_now`. The extractor itself has
no knowledge of shirts or Buy Now buttons.
