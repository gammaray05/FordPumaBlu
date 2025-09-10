export default function Confetti(){
  const n = 18
  const arr = [...Array(n).keys()]
  return (
    <>
      <div className="confetti">
        {arr.map(i => {
          const left = Math.random() * 100
          const delay = Math.random() * 2
          const size = 6 + Math.random() * 8
          const colors = ['#00B7FF','#FF2EA6','#00E3B5','#FF7A00','#7B42FF']
          const st = {
            position:'absolute', left:left+'%', top:'-10px', width:size, height:size,
            background:colors[i%colors.length], borderRadius:9999, opacity:.95,
            animation:`fall 1.8s ${delay}s ease-in forwards`, boxShadow:'0 2px 6px rgba(0,0,0,.12)'
          }
          return <span key={i} style={st}/>
        })}
      </div>
      <style>{`@keyframes fall{to{transform:translateY(120vh) rotate(240deg);opacity:.98}}`}</style>
    </>
  )
}

