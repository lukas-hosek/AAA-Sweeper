import asyncio
from playwright.async_api import async_playwright
D='/tmp/claude-0/-home-claude/d78743a1-6a1d-564d-bbd8-066f6fc59d0d/scratchpad/'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/google/chrome/chrome',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
        pg=await b.new_page(viewport={'width':1440,'height':900});errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and 'fonts' not in m.text else None)
        await pg.goto('file://'+D+'test.html');await pg.wait_for_timeout(800)
        await pg.evaluate("window.__t.audio()")
        await pg.evaluate("(()=>{window.__t.start('normal',4);return 0})()");await pg.wait_for_timeout(2500)
        r=await pg.evaluate("""(()=>{const out=[];const ids=[];for(let i=0;i<40;i++){const id=window.__t.nc();ids.push(id);}
          const prof=ids.filter(x=>x.startsWith('pa_'));return {theme:window.__t.G().theme.name,first10:ids.slice(0,10),profCount:prof.length,uniq:new Set(prof).size,
          has:Array.from({length:20},(_,i)=>'pa_'+(i+5)).every(k=>(window.__t.V(k)||{}).w==='prof')}})()""")
        print(r)
        await pg.evaluate("(()=>{window.__t.say('pa_7');return 0})()");await pg.wait_for_timeout(2500)
        await pg.screenshot(path=D+'shots/prof.png')
        print(await pg.evaluate("(()=>window.__t.VM().active.map(v=>v.id))()"),errs)
        await b.close()
asyncio.run(main())
