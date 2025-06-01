on run argv
    if (count of argv) < 1 then
        error "Todo ID required"
    end if
    
    set todoId to item 1 of argv
    
    tell application "Things3"
        set targetTodo to missing value
        
        -- Search in all lists for the todo
        set allLists to {list "Inbox", list "Today", list "Anytime", list "Upcoming", list "Someday", list "Logbook", list "Trash"}
        
        repeat with currentList in allLists
            try
                repeat with toDo in to dos of currentList
                    if id of toDo is equal to todoId then
                        set targetTodo to toDo
                        exit repeat
                    end if
                end repeat
                if targetTodo is not missing value then exit repeat
            on error
                -- Continue to next list if this one fails
            end try
        end repeat
        
        -- Also search in projects
        if targetTodo is missing value then
            repeat with proj in projects
                try
                    repeat with toDo in to dos of proj
                        if id of toDo is equal to todoId then
                            set targetTodo to toDo
                            exit repeat
                        end if
                    end repeat
                    if targetTodo is not missing value then exit repeat
                on error
                    -- Continue to next project if this one fails
                end try
            end repeat
        end if
        
        if targetTodo is missing value then
            error "Todo not found: " & todoId
        end if
        
        -- Extract all details
        set todoName to name of targetTodo
        set todoNotes to notes of targetTodo
        if todoNotes is missing value then set todoNotes to ""
        
        -- Get area name
        set todoArea to ""
        if area of targetTodo is not missing value then
            set todoArea to name of area of targetTodo
        end if
        
        -- Get tag names
        set todoTags to ""
        if (count of tags of targetTodo) > 0 then
            set tagNames to {}
            repeat with aTag in tags of targetTodo
                set end of tagNames to name of aTag
            end repeat
            set AppleScript's text item delimiters to ","
            set todoTags to tagNames as string
            set AppleScript's text item delimiters to ""
        end if
        
        -- Get deadline
        set todoDeadline to ""
        if due date of targetTodo is not missing value then
            set todoDeadline to (due date of targetTodo) as string
        end if
        
        -- Get scheduled date
        set todoScheduledDate to ""
        if scheduled date of targetTodo is not missing value then
            set todoScheduledDate to (scheduled date of targetTodo) as string
        end if
        
        -- Get status
        set todoStatus to ""
        if status of targetTodo is open then
            set todoStatus to "open"
        else if status of targetTodo is completed then
            set todoStatus to "completed"
        else if status of targetTodo is canceled then
            set todoStatus to "canceled"
        end if
        
        -- Get creation date
        set todoCreationDate to ""
        if creation date of targetTodo is not missing value then
            set todoCreationDate to (creation date of targetTodo) as string
        end if
        
        -- Get completion date
        set todoCompletionDate to ""
        if completion date of targetTodo is not missing value then
            set todoCompletionDate to (completion date of targetTodo) as string
        end if
        
        -- Get project name if todo is in a project
        set todoProject to ""
        try
            if project of targetTodo is not missing value then
                set todoProject to name of project of targetTodo
            end if
        on error
            -- Todo might not be in a project
        end try
        
        -- Build JSON-like output (pipe-separated for parsing)
        set output to todoId & "|" & todoName & "|" & todoArea & "|" & todoTags & "|" & todoDeadline & "|" & todoScheduledDate & "|" & todoStatus & "|" & todoCreationDate & "|" & todoCompletionDate & "|" & todoProject & "|" & todoNotes
        
        return output
    end tell
end run