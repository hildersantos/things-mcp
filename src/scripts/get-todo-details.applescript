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
        try
            set todoTags to tag names of targetTodo
            if todoTags is missing value then set todoTags to ""
        on error
            set todoTags to ""
        end try
        
        -- Get deadline
        set todoDeadline to ""
        if due date of targetTodo is not missing value then
            set todoDeadline to (due date of targetTodo) as string
        end if
        
        -- Get scheduled date
        set todoScheduledDate to ""
        try
            set scheduledDateProp to activation date of targetTodo
            if scheduledDateProp is not missing value then
                set todoScheduledDate to scheduledDateProp as string
            end if
        on error
            -- Property might not exist or be named differently
        end try
        
        -- Get status
        set todoStatus to ""
        try
            set todoStatusValue to status of targetTodo as string
            set todoStatus to todoStatusValue
        on error
            set todoStatus to "unknown"
        end try
        
        -- Get creation date
        set todoCreationDate to ""
        try
            set creationDateProp to creation date of targetTodo
            if creationDateProp is not missing value then
                set todoCreationDate to creationDateProp as string
            end if
        on error
            -- Property might not exist
        end try
        
        -- Get completion date
        set todoCompletionDate to ""
        try
            set completionDateProp to completion date of targetTodo
            if completionDateProp is not missing value then
                set todoCompletionDate to completionDateProp as string
            end if
        on error
            -- Property might not exist
        end try
        
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