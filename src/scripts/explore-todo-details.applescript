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
        
        set output to ""
        
        -- Get basic todo info
        set output to output & "TODO: " & name of targetTodo & linefeed
        set output to output & "ID: " & id of targetTodo & linefeed
        
        -- Try to get checklist items
        try
            set checklistItems to checklist items of targetTodo
            set output to output & "Checklist items count: " & (count of checklistItems) & linefeed
            
            repeat with checklistItem in checklistItems
                try
                    set itemTitle to name of checklistItem
                    set itemCompleted to completed of checklistItem
                    set output to output & "CHECKLIST: " & itemTitle & " (Completed: " & itemCompleted & ")" & linefeed
                on error errMsg
                    set output to output & "Error processing checklist item: " & errMsg & linefeed
                end try
            end repeat
            
        on error errMsg
            set output to output & "No checklist or error: " & errMsg & linefeed
        end try
        
        -- Try to get heading info
        try
            set todoHeading to heading of targetTodo
            if todoHeading is not missing value then
                set headingName to name of todoHeading
                set headingId to id of todoHeading
                set output to output & "HEADING: " & headingName & " (ID: " & headingId & ")" & linefeed
            else
                set output to output & "No heading" & linefeed
            end if
        on error errMsg
            set output to output & "Heading info unavailable: " & errMsg & linefeed
        end try
        
        -- Try to get project info
        try
            if project of targetTodo is not missing value then
                set projectName to name of project of targetTodo
                set projectId to id of project of targetTodo
                set output to output & "PROJECT: " & projectName & " (ID: " & projectId & ")" & linefeed
            else
                set output to output & "No project" & linefeed
            end if
        on error errMsg
            set output to output & "Project info unavailable: " & errMsg & linefeed
        end try
        
        return output
    end tell
end run