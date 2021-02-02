const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("transactions")) || []
    },
    set(transactions){
        localStorage.setItem("transactions", JSON.stringify(transactions))
    }
}

const Modal = {
    // open(){
    //     document.querySelector(".modal-overlay").classList.add("active");
    // },
    // close(){
    //     document.querySelector(".modal-overlay").classList.remove("active");
    // }
    toggle(){
        document.querySelector(".modal-overlay").classList.toggle("active");
    } 
}   

const Transaction = {
    all: Storage.get(),
    add(transaction){
        Transaction.all.push(transaction);
        App.reload();
    },
    remove(index){
        Transaction.all.splice(index, 1);
        App.reload();
    },
    income(){
        let valor = 0;

        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) valor+=transaction.amount
        })

        return valor
    },
    expense(){
        let valor = 0;

        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) valor+=transaction.amount
        })

        return valor
    },
    total(){
        return Transaction.income() + Transaction.expense()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index){
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr);
    },
    innerHTMLTransaction(transaction, index){
        const amountClass = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `        
        <td class="description">${transaction.description}</td>
        <td class="${amountClass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `

        return html;
    },
    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.income())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expense())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")
        value = Number(value)/100
        value = value.toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },
    formatAmount(value){
        return Number(value) * 100
    },
    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

Form = {
    description: document.querySelector('#description'),
    amount: document.querySelector('#amount'),
    date: document.querySelector('#date'),
    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateFields(){
        const { description, amount, date } = Form.getValues()
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") 
            throw new Error("Se não preencher todos os campos, dá merda")
    },
    formatValues(){
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        return {description, amount, date} 
    },
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event){
        event.preventDefault()
        try{
            Form.validateFields()
            const newTransaction = Form.formatValues()
            Transaction.add(newTransaction)
            Form.clearFields()
            Modal.toggle()
            Storage.set(Transaction.all)
        }
        catch(error){
            alert(error.message)
        }
    }
}

const App = {
    init(){
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance();

        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransactions()
        
        App.init()
    }
}

App.init()