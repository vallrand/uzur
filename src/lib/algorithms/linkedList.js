export const LinkedList = () => Object.setPrototypeOf({
    head: null
}, LinkedList.prototype)

LinkedList.prototype = {
    push: function(...elements){
        for(let i = 0, length = elements.length; i < length; i++){
            let element = elements[i]
            element.next = this.head
            this.head = element
        }
    },
    remove: function(...elements){
        for(let i = elements.length - 1; i >= 0; i--)
            if(elements[i].next !== undefined)
                elements[i].removeFlag = true
    },
    forEach: function(callback){
        let prev = null,
            node = this.head
        while(node)
            if(node.removeFlag){
                let temp = node
                node = prev
                    ? prev.next = node.next
                    : this.head = node.next
                delete temp.next
                delete temp.removeFlag
            }else{
                callback(node)
                
                prev = node
                node = node.next
            }
    },
    clear: function(){
        let node = this.head
        this.head = null
        while(node){
            let temp = node
            node = node.next
            delete temp.next
            delete temp.removeFlag
        }
    }
}