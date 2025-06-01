on run argv
    -- Optional max results parameter
    set maxResults to -1
    if (count of argv) > 0 then
        try
            set maxResults to (item 1 of argv) as integer
        end try
    end if
    
    tell application "Things3"
        set output to ""
        set todoCount to 0
        
        repeat with toDo in to dos of list "Logbook"
            -- Check max results limit
            if maxResults > 0 and todoCount ≥ maxResults then
                exit repeat
            end if
            
            try
                set todoId to id of toDo
                set todoName to name of toDo
                
                -- Get area name if exists
                set todoArea to ""
                if area of toDo is not missing value then
                    set todoArea to name of area of toDo
                end if
                
                -- Get tag names
                set todoTags to ""
                if (count of tags of toDo) > 0 then
                    set tagNames to {}
                    repeat with aTag in tags of toDo
                        set end of tagNames to name of aTag
                    end repeat
                    set AppleScript's text item delimiters to ","
                    set todoTags to tagNames as string
                    set AppleScript's text item delimiters to ""
                end if
                
                -- Build output line
                set output to output & todoId & "|" & todoName & "|" & todoArea & "|" & todoTags & linefeed
                set todoCount to todoCount + 1
                
            on error errMsg
                -- Log error but continue processing
                log "Error processing todo: " & errMsg
            end try
        end repeat
        
        return output
    end tell
end run