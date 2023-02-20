const updateTransactionStatus = async (id, action) => {
    await fetch("/update-transaction", {
        method: "PUT",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id, 
            status: 
                action === "approve" ? "approved" : 
                action === "reject" ? "rejected": 
                "pending"
        }),

    }).then(res => {
        return res.json();
    }).then(d => {
        console.log({ d })
        window.location.reload();
    }).catch(err => console.log(err));
}


document.body.addEventListener('click', function (e) {
    var target = e.target;
    //console.log(target.nodeName, target);
    if (target.nodeName === 'A') {
        const { trans_id, trans_type } = target.dataset
        console.log(trans_id, trans_type);
        updateTransactionStatus(trans_id, trans_type)
    }
});