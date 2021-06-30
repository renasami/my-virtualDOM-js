// import react from 'react';

function App() {

    const img = ["itagaki.png","pien.png"];
    let imgs = ["itagaki.png"]
    const listItems = imgs.map((n) =>
    <li>{n}</li>
    );

    return (
        <>
            <Button onClick={}></Button>
            <ul>{listItems}</ul>
        </>
    )
}

// const target = document.querySelector('#app2');
// ReactDOM.render(<App/>, target);



  