---
title: 二叉树的遍历 | Go基础
tags:
  - 算法
  - Go
cover_index: >-
  http://cdn.tigerb.cn/20200421124528.jpg?imageMogr2/thumbnail/640x480!/format/webp/blur/1x0/quality/75|imageslim
cover_detail: >-
  http://cdn.tigerb.cn/20200421124528.jpg?imageMogr2/thumbnail/1500x1000!/format/webp/blur/1x0/quality/75|imageslim
categories:
  - go-base
date: 2020-04-21 22:22:11
---

<span>

# 前言
---

用Go语言复习下二叉树的遍历:

- 前序
- 中序
- 后序
- 层序

# 准备
---

一个简单的二叉树：

```
      1
    /   \
  2       3
 / \    /  \
4   5  6    7
      / \
     8   9
```

推理出，理论输出:

```
前序输出: 1 2 4 5 3 6 8 9 7
中序输出: 4 2 5 1 8 6 9 3 7
后序输出: 4 5 2 8 9 6 7 3 1
层序输出: 1 2 3 4 5 6 7 8 9
```

代码：

```go
// Tree 二叉树的基础结构体
type Tree struct {
    // 值
    Val    int
    // 左子节点指针
    Left   *Tree
    // 右子节点指针
    Right  *Tree
    // 是否是根节点
	IsRoot bool
}
```

```go
// 初始化这个简单的二叉树
var node9 = &Tree{
	Val: 9,
}
var node8 = &Tree{
	Val: 8,
}
var node7 = &Tree{
	Val: 7,
}
var node6 = &Tree{
	Val:   6,
	Left:  node8,
	Right: node9,
}
var node5 = &Tree{
	Val: 5,
}
var node4 = &Tree{
	Val: 4,
}
var node3 = &Tree{
	Val:   3,
	Left:  node6,
	Right: node7,
}
var node2 = &Tree{
	Val:   2,
	Left:  node4,
	Right: node5,
}
var root = &Tree{
	Val:    1,
	Left:   node2,
	Right:  node3,
	IsRoot: true,
}
```

# 遍历
---

## **前序**

```go
// 前序
func preorder(t *Tree) {
	if t == nil {
		return
	}
	fmt.Println(t.Val)
	preorder(t.Left)
	preorder(t.Right)
}

func main() {
	fmt.Println("前序遍历开始...")
	preorder(root)
	fmt.Println("")
}

```

输出：
```
[Running] go run "../easy-tips/go/src/algorithm/tree.go"
前序遍历开始...
1
2
4
5
3
6
8
9
7
```

## **中序**

```go
// 中序
func inorder(t *Tree) {
	if t == nil {
		return
	}
	inorder(t.Left)
	fmt.Println(t.Val)
	inorder(t.Right)
}

func main() {
	fmt.Println("中序遍历开始...")
	inorder(root)
	fmt.Println("")
}
```

输出：

```
[Running] go run "../easy-tips/go/src/algorithm/tree.go"
中序遍历开始...
4
2
5
1
8
6
9
3
7
```

## **后序**

```go
// 后序
func postorder(t *Tree) {
	if t == nil {
		return
	}
	postorder(t.Left)
	postorder(t.Right)
	fmt.Println(t.Val)
}

func main() {
	fmt.Println("前序遍历开始...")
	preorder(root)
    fmt.Println("")
}
```

输出：

```
[Running] go run "../easy-tips/go/src/algorithm/tree.go"
后序遍历开始...
4
5
2
8
9
6
7
3
1
```

## **层序**

使用队列达到有序的目的。

```go
// Queue 队列
type Queue struct {
	Val    []*Tree
	Length int
}

// Push 入队列
func (q *Queue) Push(t *Tree) {
	q.Val = append(q.Val, t)
}

// Pop 出队列
func (q *Queue) Pop() (node *Tree) {
	len := q.Len()
	if len == 0 {
		panic("Queue is empty")
	}
	node = q.Val[0]
	if len == 1 {
		q.Val = []*Tree{}
	} else {
		q.Val = q.Val[1:]
	}
	return
}

// Len 队列长度
func (q *Queue) Len() int {
	q.Length = len(q.Val)
	return q.Length
}

// 层序
func levelorder(r *Tree) {
	queue := Queue{}
	queue.Push(root)
	for queue.Len() > 0 {
		node := queue.Pop()
		if node == nil {
			panic("node is nil")
		}
		// 打印根结点
		if node.IsRoot {
			fmt.Println(node.Val)
		}
		if node.Left != nil {
			fmt.Println(node.Left.Val)
			queue.Push(node.Left)
		}
		if node.Right != nil {
			fmt.Println(node.Right.Val)
			queue.Push(node.Right)
		}
	}
}

func main() {
	fmt.Println("层序遍历开始...")
	levelorder(root)
	fmt.Println("")
}
```

输出：

```
[Running] go run "../easy-tips/go/src/algorithm/tree.go"
层序遍历开始...
1
2
3
4
5
6
7
8
9
```

# 结语
---

本文便于，后续回忆复习使用。