/**
 * toDoController.
 *
 * @author Adam Bergman
 * @version 1.0
 */

const ToDoItem = require('../models/ToDoItem')

const toDoController = {}

/**
 * index GET
 */
toDoController.index = async (req, res, next) => {
  try {
    const locals = {
      toDoItems: (await ToDoItem.find({}))
        .map(toDoItem => ({
          id: toDoItem._id,
          description: toDoItem.description,
          done: toDoItem.done,
          username: toDoItem.username,
          owner: toDoItem.username === req.session.username
        }))
    }
    res.render('todo/index', { locals })
  } catch (error) {
    next(error)
  }
}

/**
 * create GET
 */
toDoController.create = async (req, res, next) => {
  const locals = {
    description: '',
    done: false
  }

  res.render('todo/create', { locals })
}

/**
 * create POST
 */
toDoController.createPost = async (req, res, next) => {
  try {
    const toDoItem = new ToDoItem({
      description: req.body.description,
      done: req.body.done,
      username: req.session.username
    })
    await toDoItem.save()

    req.session.flash = { type: 'success', text: 'To-do item was created successfully.' }
    res.redirect('.')
  } catch (error) {
    req.session.flash = { type: 'danger', text: error.message }
    res.redirect('./create')
  }
}

/**
 * edit GET
 */
toDoController.edit = async (req, res, next) => {
  try {
    const toDoItem = await ToDoItem.findOne({ _id: req.params.id })
    if (toDoItem.username === req.session.username) {
      const locals = {
        id: toDoItem._id,
        description: toDoItem.description,
        done: toDoItem.done
      }
      res.render('todo/edit', { locals })
    } else {
      req.session.flash = { type: 'danger', text: 'You are not allowed to edit this post' }
      res.redirect('/todo')
    }
  } catch (error) {
    req.session.flash = { type: 'danger', text: error.message }
    res.redirect('.')
  }
}

/**
 * edit POST
 */
toDoController.editPost = async (req, res, next) => {
  try {
    const result = await ToDoItem.updateOne({ _id: req.body.id }, {
      description: req.body.description,
      done: req.body.done === 'on'
    })

    if (result.nModified === 1) {
      req.session.flash = { type: 'success', text: 'To-do item was updated successfully.' }
    }
    res.redirect('.')
  } catch (error) {
    req.session.flash = { type: 'danger', text: error.message }
    res.redirect(`./edit/${req.body.id}`)
  }
}

/**
 * delete GET
 */
toDoController.delete = async (req, res, next) => {
  try {
    const toDoItem = await ToDoItem.findOne({ _id: req.params.id })
    if (toDoItem.username === req.session.username) {
      const locals = {
        id: toDoItem._id,
        description: toDoItem.description,
        done: toDoItem.done
      }
      res.render('todo/delete', { locals })
    } else {
      req.session.flash = { type: 'danger', text: 'You are not allowed to delete this post' }
      res.redirect('/todo')
    }
  } catch (error) {
    req.session.flash = { type: 'danger', text: error.message }
    res.redirect('.')
  }
}

/**
 * delete POST
 */
toDoController.deletePost = async (req, res, next) => {
  try {
    await ToDoItem.deleteOne({ _id: req.body.id })

    req.session.flash = { type: 'success', text: 'To-do item was removed successfully.' }
    res.redirect('.')
  } catch (error) {
    req.session.flash = { type: 'danger', text: error.message }
    req.redirect(`./delete/${req.body.id}`)
  }
}

// Exports.
module.exports = toDoController
