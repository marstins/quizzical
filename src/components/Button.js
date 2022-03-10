export default function Button({text, handleClick}) {
  
  return (
    <button 
      className="start-button" 
      onClick={handleClick}
    >
      {text}
    </button>
  )
}