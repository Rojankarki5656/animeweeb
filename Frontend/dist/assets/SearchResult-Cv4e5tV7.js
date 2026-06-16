import{e as w,r,j as e,f as S,H as P,L as I,F as C,C as $}from"./index-CzhI8Mwg.js";import{H as k}from"./Heading-DLxJngrq.js";import{F as R}from"./Footer-DCfgt2b_.js";import{S as E}from"./star-DVYDUMTo.js";import{C as L}from"./chevron-left-XXkseGBT.js";import"./index-B-tO80-p.js";import"./iconBase-B8fK25C_.js";const T="https://graphql.anilist.co",A=`
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
        total
      }
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        format
        episodes
        averageScore
        status
        startDate {
          year
        }
      }
    }
  }
`,Y=()=>{const[N]=w(),t=N.get("q")||"",[d,i]=r.useState([]),[a,n]=r.useState(null),[g,x]=r.useState(!1),[m,h]=r.useState(null),[o,p]=r.useState(1),[v,b]=r.useState(!0),l=r.useCallback(async s=>{if(t.trim()){x(!0),h(null);try{const c=await(await fetch(T,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:A,variables:{search:t,page:s,perPage:20}})})).json();if(c.errors)throw new Error(c.errors[0].message);const y=c.data.Page;i(y.media||[]),n(y.pageInfo)}catch(j){h(j.message),i([]),n(null)}finally{x(!1),b(!1)}}},[t]);r.useEffect(()=>{t?(p(1),l(1)):(i([]),n(null))},[t,l]);const u=s=>{s>=1&&a?.hasNextPage&&(p(s),l(s),window.scrollTo({top:0,behavior:"smooth"}))},f=s=>s.romaji||s.english||s.native;return v&&g?e.jsx("div",{className:"flex justify-center items-center h-screen",children:e.jsx(S,{className:"w-8 h-8 text-primary animate-spin"})}):m?e.jsxs("div",{className:"flex flex-col justify-center items-center h-screen text-center px-4",children:[e.jsx("p",{className:"text-red-500 mb-4",children:m}),e.jsx("button",{onClick:()=>l(1),className:"px-4 py-2 bg-primary text-black rounded-lg",children:"Retry"})]}):!g&&d.length===0&&t?e.jsxs("div",{className:"flex flex-col justify-center items-center h-screen text-center",children:[e.jsxs("h2",{className:"text-2xl font-bold mb-2",children:['No results found for "',t,'"']}),e.jsx("p",{className:"text-gray-400",children:"Try a different keyword or check the spelling"})]}):e.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24 pb-12",children:[e.jsxs(P,{children:[e.jsx("title",{children:t?`Search: ${t} · AnimeWeebs`:"Search Results"}),e.jsx("meta",{name:"description",content:`Search results for "${t}" – find your next favorite anime.`})]}),e.jsxs("div",{className:"container mx-auto px-4 max-w-7xl",children:[e.jsxs("div",{className:"flex items-center gap-4 mb-8",children:[e.jsxs(k,{children:['Search results for "',t,'"']}),a&&e.jsxs("span",{className:"text-sm text-gray-400",children:["(",a.total," results)"]})]}),e.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6",children:d.map(s=>e.jsxs(I,{to:`/anime/${s.id}`,className:"group relative overflow-hidden rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10",children:[e.jsxs("div",{className:"relative aspect-[2/3] overflow-hidden",children:[e.jsx("img",{src:s.coverImage?.large||s.coverImage?.medium,alt:f(s.title),className:"w-full h-full object-cover transform group-hover:scale-105 transition duration-500",loading:"lazy"}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"})]}),e.jsxs("div",{className:"p-3",children:[e.jsx("h3",{className:"text-sm font-bold text-white truncate group-hover:text-indigo-300 transition",children:f(s.title)}),e.jsxs("div",{className:"flex items-center justify-between mt-2 text-xs text-gray-400",children:[e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx(C,{className:"w-3 h-3"}),s.format||"TV"]}),s.averageScore&&e.jsxs("span",{className:"flex items-center gap-1",children:[e.jsx(E,{className:"w-3 h-3 text-yellow-400"}),s.averageScore/10]})]}),s.episodes&&e.jsxs("p",{className:"text-xs text-gray-500 mt-1",children:[s.episodes," eps"]}),s.startDate?.year&&e.jsx("p",{className:"text-xs text-gray-500",children:s.startDate.year})]})]},s.id))}),a&&a.total>0&&e.jsxs("div",{className:"flex justify-center items-center gap-4 mt-10",children:[e.jsxs("button",{onClick:()=>u(o-1),disabled:o===1,className:`px-4 py-2 rounded-lg flex items-center gap-2 transition ${o===1?"bg-gray-800 text-gray-500 cursor-not-allowed":"bg-gray-800 text-white hover:bg-indigo-600"}`,children:[e.jsx(L,{className:"w-4 h-4"})," Previous"]}),e.jsxs("span",{className:"text-gray-300",children:["Page ",o," of ",a.lastPage]}),e.jsxs("button",{onClick:()=>u(o+1),disabled:!a?.hasNextPage,className:`px-4 py-2 rounded-lg flex items-center gap-2 transition ${a?.hasNextPage?"bg-gray-800 text-white hover:bg-indigo-600":"bg-gray-800 text-gray-500 cursor-not-allowed"}`,children:["Next ",e.jsx($,{className:"w-4 h-4"})]})]}),e.jsx(R,{})]})]})};export{Y as default};
